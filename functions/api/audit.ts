/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../types';
import { CORS_HEADERS } from '../types';
import {
  INDUSTRY_CLASSIFIER_PROMPT,
  SENIOR_ANALYST_PROMPT,
  CRITIC_PATCH_PROMPT,
} from '../../src/lib/audit/prompts';
import type {
  IndustryClassification,
  AuditResult,
  AuditRequestBody,
  Opportunity,
} from '../../src/lib/audit/types';
import {
  jsonError,
  isUrl,
  fetchHtml,
  verifyTurnstile,
  checkAndConsumeRateLimit,
  checkAndIncrementDailyCap,
  isIpAllowlisted,
  callAnthropic,
  callAnthropicWithThinking,
  parseJsonFromLlm,
  sseEvent,
} from './_audit-utils';
import {
  isValidEmail,
  isDisposableEmail,
  persistLead,
  sendClientReport,
  notifyGibran,
} from './_lead-handler';

const MAX_INPUT_LENGTH = 500;
const MIN_INPUT_LENGTH = 10;
const MAX_EXTRA_FIELD_LENGTH = 200;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 25;
const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 7;

interface AnalystDraft {
  negocio_detectado: string;
  oportunidades: Opportunity[];
  recomendacion_prioritaria: { oportunidad_index: number; razon: string };
}

// El crítico devuelve solo correcciones puntuales (parches), no el JSON completo.
type OpportunityPatch = Partial<Opportunity> & { index: number };

interface CriticResponse {
  patches?: OpportunityPatch[];
  recomendacion_prioritaria?: { oportunidad_index: number; razon: string };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // --- 1. Parse body -------------------------------------------------------
  let body: AuditRequestBody;
  try {
    body = (await request.json()) as AuditRequestBody;
  } catch {
    return jsonError(400, 'invalid_body', 'Body inválido (JSON requerido).');
  }

  // --- 2. Validate input length -------------------------------------------
  const input = String(body.input ?? '').trim();
  if (input.length < MIN_INPUT_LENGTH) {
    return jsonError(400, 'input_too_short', `Mínimo ${MIN_INPUT_LENGTH} caracteres.`);
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return jsonError(400, 'input_too_long', `Máximo ${MAX_INPUT_LENGTH} caracteres.`);
  }

  // --- 3. Validate extra fields -------------------------------------------
  if (body.extra) {
    for (const v of Object.values(body.extra)) {
      if (typeof v === 'string' && v.length > MAX_EXTRA_FIELD_LENGTH) {
        return jsonError(
          400,
          'extra_field_too_long',
          `Máximo ${MAX_EXTRA_FIELD_LENGTH} caracteres por campo extra.`,
        );
      }
    }
  }

  // --- 3.5. Validate contact fields ---------------------------------------
  const contact = body.contact;
  if (!contact || typeof contact !== 'object') {
    return jsonError(400, 'contact_required', 'Necesito nombre y empresa.');
  }
  const cNombre = String(contact.nombre ?? '').trim();
  const cEmpresa = String(contact.empresa ?? '').trim();
  const cEmail = contact.email ? String(contact.email).trim().toLowerCase() : '';
  const cTelefono = contact.telefono ? String(contact.telefono).trim() : '';

  if (cNombre.length < 2) return jsonError(400, 'nombre_required', 'Necesito tu nombre.');
  if (cNombre.length > MAX_NAME_LENGTH) return jsonError(400, 'nombre_too_long');
  if (cEmpresa.length < 2) return jsonError(400, 'empresa_required', 'Necesito el nombre de tu empresa.');
  if (cEmpresa.length > MAX_NAME_LENGTH) return jsonError(400, 'empresa_too_long');
  // Email obligatorio: garantiza que el reporte llegue aunque el cliente abandone.
  if (!cEmail) return jsonError(400, 'email_required', 'Necesito tu email para enviarte el reporte.');
  if (!isValidEmail(cEmail)) return jsonError(400, 'email_invalid');
  if (cEmail && isDisposableEmail(cEmail)) {
    return jsonError(400, 'email_disposable', 'Usa un email real para enviarte el reporte.');
  }
  if (cTelefono && cTelefono.length > MAX_PHONE_LENGTH) return jsonError(400, 'telefono_too_long');

  // --- 4. Turnstile verification ------------------------------------------
  const tsOk = await verifyTurnstile(
    body.turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    request,
  );
  if (!tsOk) {
    return jsonError(
      401,
      'turnstile_failed',
      'Verificación anti-bot falló. Recarga la página e intenta de nuevo.',
    );
  }

  // --- 5. Rate limit + daily cap (saltados para IPs en la allowlist) -------
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  if (!isIpAllowlisted(ip, env.AUDIT_IP_ALLOWLIST)) {
    const rl = await checkAndConsumeRateLimit(env.KV, ip);
    if (!rl.allowed) {
      return jsonError(
        429,
        rl.reason ?? 'rate_limited',
        'Ya hiciste varios diagnósticos hoy desde esta red. Vuelve mañana o escríbeme por WhatsApp.',
      );
    }

    const cap = await checkAndIncrementDailyCap(env.KV, env.DAILY_AUDIT_CAP);
    if (!cap.allowed) {
      return jsonError(
        429,
        'daily_cap_reached',
        'Audits gratis agotados por hoy. Vuelve mañana o escríbeme por WhatsApp.',
      );
    }
  }

  // --- 7. Fetch URL HTML if input looks like a URL -------------------------
  const htmlContext = isUrl(input) ? await fetchHtml(input) : null;

  // --- 8. SSE stream — el pipeline corre hasta el final vía context.waitUntil,
  //        aunque el cliente cierre la pestaña (garantiza el envío del correo).
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const send = (event: string, data: unknown): void => {
    // Si el cliente se desconectó, el write falla; lo ignoramos y el pipeline sigue.
    void writer.write(sseEvent(event, data)).catch(() => {});
  };

  const pipeline = (async () => {
      try {
        // ---- AGENT 1: Industry classifier ----
        send('status', { stage: 'classifying' });
        const classifierUser = buildClassifierUserMessage(input, body.extra, htmlContext);
        const classifierText = await callAnthropic(env.ANTHROPIC_API_KEY, {
          system: INDUSTRY_CLASSIFIER_PROMPT,
          user: classifierUser,
          maxTokens: 500,
          temperature: 0.3,
        });
        const industry = parseJsonFromLlm<IndustryClassification>(classifierText);
        send('industry', industry);

        // ---- AGENT 2: Senior analyst (streaming with thinking) ----
        send('status', { stage: 'analyzing' });
        const analystUser = buildAnalystUserMessage(input, body.extra, htmlContext, industry);
        const analystText = await callAnthropicWithThinking(env.ANTHROPIC_API_KEY, {
          system: SENIOR_ANALYST_PROMPT,
          user: analystUser,
          maxTokens: 2000,
          thinkingBudget: 1100,
          onThinking: (delta) => send('thinking', { delta }),
        });
        const draft = parseJsonFromLlm<AnalystDraft>(analystText);
        send('opportunities_draft', draft);

        // ---- AGENT 3: Critic (patch-based) ----
        // Revisa el draft y devuelve SOLO correcciones puntuales, no el JSON
        // completo → mucho más rápido que regenerar todo. Si falla, seguimos
        // con el draft del analista (degradación elegante).
        send('status', { stage: 'critiquing' });
        let oportunidades = draft.oportunidades;
        let recomendacion = draft.recomendacion_prioritaria;
        try {
          const criticText = await callAnthropic(env.ANTHROPIC_API_KEY, {
            system: CRITIC_PATCH_PROMPT,
            user: buildCriticPatchUserMessage(industry, draft),
            maxTokens: 1500,
            temperature: 0.3,
          });
          const critic = parseJsonFromLlm<CriticResponse>(criticText);
          if (critic.patches?.length) {
            oportunidades = oportunidades.map((o, i) => {
              const patch = critic.patches?.find((p) => p.index === i);
              if (!patch) return o;
              const { index: _index, ...fields } = patch;
              return { ...o, ...fields };
            });
            send('opportunities_draft', { ...draft, oportunidades });
          }
          if (critic.recomendacion_prioritaria) {
            recomendacion = critic.recomendacion_prioritaria;
          }
        } catch {
          // Crítico falló o devolvió JSON inválido — usamos el draft tal cual.
        }

        // ---- Assemble final audit ----
        // El benchmark es determinista (no necesita otra llamada a la IA): el
        // score viene del clasificador y el potencial es score + 3 (cap 10).
        const final: AuditResult = {
          audit_id: '',
          negocio_detectado: draft.negocio_detectado,
          industria: industry.industria,
          score_madurez: industry.maturity_score,
          benchmark: {
            industria_promedio: 5,
            lider: 9,
            tu_potencial: Math.min(10, industry.maturity_score + 3),
          },
          oportunidades,
          recomendacion_prioritaria: recomendacion,
        };

        // ---- Save + return ----
        const auditId = crypto.randomUUID();
        final.audit_id = auditId;
        send('status', { stage: 'saving' });
        await env.KV.put(`audit:${auditId}`, JSON.stringify(final), {
          expirationTtl: AUDIT_TTL_SECONDS,
        });

        // Persist lead snapshot and notify Gibran for every successful audit
        const normalizedContact = {
          nombre: cNombre,
          empresa: cEmpresa,
          ...(cEmail && { email: cEmail }),
          ...(cTelefono && { telefono: cTelefono }),
        };
        const lead = await persistLead(env.KV, final, normalizedContact);
        send('done', { audit_id: auditId, audit: final });

        // Correos — se esperan (await) para que se completen DENTRO de la
        // ventana de waitUntil, aunque el cliente ya se haya ido. Por eso el
        // correo llega aunque el usuario abandone a media carga.
        const [, sent] = await Promise.all([
          notifyGibran(env.RESEND_API_KEY, lead, final),
          normalizedContact.email
            ? sendClientReport(env.RESEND_API_KEY, final, normalizedContact)
            : Promise.resolve(false),
        ]);
        send('email_status', {
          sent,
          ...(sent ? {} : { reason: normalizedContact.email ? 'send_failed' : 'no_email' }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown';
        send('error', { code: 'pipeline_failed', message });
      } finally {
        await writer.close().catch(() => {});
      }
  })();

  // Mantiene viva la Function hasta que el pipeline termine (incl. el correo),
  // aunque el cliente cierre la conexión SSE.
  context.waitUntil(pipeline);

  return new Response(readable, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  });
};

/* ============================================================
 * User-message builders for each agent
 * ========================================================== */

function formatExtra(extra: AuditRequestBody['extra']): string {
  if (!extra) return '';
  const parts: string[] = [];
  if (extra.industria) parts.push(`Industria declarada: ${extra.industria}`);
  if (extra.equipo) parts.push(`Equipo: ${extra.equipo}`);
  if (extra.stack) parts.push(`Stack actual: ${extra.stack}`);
  if (extra.pain) parts.push(`Dolor principal: ${extra.pain}`);
  if (parts.length === 0) return '';
  return '\n\nDatos extra del cliente:\n' + parts.map((p) => `- ${p}`).join('\n');
}

function buildClassifierUserMessage(
  input: string,
  extra: AuditRequestBody['extra'],
  htmlContext: string | null,
): string {
  return `Input del cliente:
"${input}"
${formatExtra(extra)}
${htmlContext ? `\n\nContexto HTML (sitio scrapeado, primeros 3000 caracteres):\n${htmlContext}` : ''}

Clasifica y devuelve el JSON.`;
}

function buildAnalystUserMessage(
  input: string,
  extra: AuditRequestBody['extra'],
  htmlContext: string | null,
  industry: IndustryClassification,
): string {
  return `Input original del cliente:
"${input}"
${formatExtra(extra)}
${htmlContext ? `\n\nContexto HTML del sitio (primeros 3000 caracteres):\n${htmlContext}` : ''}

Clasificación previa:
- Industria: ${industry.industria}
- Sub-vertical: ${industry.sub_vertical}
- Score de madurez: ${industry.maturity_score}/10
- Signals detectados: ${industry.signals.join('; ')}

Analiza este negocio. Aplica los patrones de la biblioteca. Devuelve SOLO 1 oportunidad (la de mayor impacto) + la prioritaria (index 0). JSON estricto.`;
}

function buildCriticPatchUserMessage(
  industry: IndustryClassification,
  draft: AnalystDraft,
): string {
  return `Clasificación de industria:
- Industria: ${industry.industria}
- Sub-vertical: ${industry.sub_vertical}
- Score de madurez: ${industry.maturity_score}/10

Draft del Senior Analyst (negocio_detectado + oportunidades + prioritaria):

\`\`\`json
${JSON.stringify(draft, null, 2)}
\`\`\`

Revisa cada oportunidad y devuelve SOLO los parches necesarios (index + campos a corregir). Si una oportunidad ya cumple, no la incluyas. JSON estricto.`;
}
