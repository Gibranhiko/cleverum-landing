/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../types';
import { CORS_HEADERS } from '../types';
import {
  INDUSTRY_CLASSIFIER_PROMPT,
  SENIOR_ANALYST_PROMPT,
  CRITIC_PROMPT,
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
  callAnthropic,
  callAnthropicWithThinking,
  parseJsonFromLlm,
  sseEvent,
} from './_audit-utils';

const MAX_INPUT_LENGTH = 500;
const MIN_INPUT_LENGTH = 10;
const MAX_EXTRA_FIELD_LENGTH = 200;
const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 7;

interface AnalystDraft {
  negocio_detectado: string;
  oportunidades: Opportunity[];
  recomendacion_prioritaria: { oportunidad_index: number; razon: string };
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

  // --- 5. Rate limit per IP -----------------------------------------------
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const rl = await checkAndConsumeRateLimit(env.KV, ip);
  if (!rl.allowed) {
    return jsonError(
      429,
      rl.reason ?? 'rate_limited',
      'Ya solicitaste un audit hoy desde esta IP. Vuelve mañana o escríbeme por WhatsApp.',
    );
  }

  // --- 6. Daily cap -------------------------------------------------------
  const cap = await checkAndIncrementDailyCap(env.KV, env.DAILY_AUDIT_CAP);
  if (!cap.allowed) {
    return jsonError(
      429,
      'daily_cap_reached',
      'Audits gratis agotados por hoy. Vuelve mañana o escríbeme por WhatsApp.',
    );
  }

  // --- 7. Fetch URL HTML if input looks like a URL -------------------------
  const htmlContext = isUrl(input) ? await fetchHtml(input) : null;

  // --- 8. SSE stream ------------------------------------------------------
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown): void => {
        controller.enqueue(sseEvent(event, data));
      };

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
          maxTokens: 4000,
          thinkingBudget: 3000,
          onThinking: (delta) => send('thinking', { delta }),
        });
        const draft = parseJsonFromLlm<AnalystDraft>(analystText);
        send('opportunities_draft', draft);

        // ---- AGENT 3: Critic + polish ----
        send('status', { stage: 'critiquing' });
        const criticUser = buildCriticUserMessage(industry, draft);
        const criticText = await callAnthropic(env.ANTHROPIC_API_KEY, {
          system: CRITIC_PROMPT,
          user: criticUser,
          maxTokens: 4000,
          temperature: 0.4,
        });
        const final = parseJsonFromLlm<AuditResult>(criticText);

        // ---- Save + return ----
        const auditId = crypto.randomUUID();
        final.audit_id = auditId;
        send('status', { stage: 'saving' });
        await env.KV.put(`audit:${auditId}`, JSON.stringify(final), {
          expirationTtl: AUDIT_TTL_SECONDS,
        });

        send('done', { audit_id: auditId, audit: final });
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown';
        send('error', { code: 'pipeline_failed', message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
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

Analiza este negocio. Aplica los patrones de la biblioteca. Devuelve 3 oportunidades en orden de impacto + la prioritaria. JSON estricto.`;
}

function buildCriticUserMessage(
  industry: IndustryClassification,
  draft: AnalystDraft,
): string {
  return `Clasificación de industria:
- Industria: ${industry.industria}
- Sub-vertical: ${industry.sub_vertical}
- Score de madurez heredado: ${industry.maturity_score}/10

Draft del Senior Analyst (negocio_detectado + 3 oportunidades + prioritaria):

\`\`\`json
${JSON.stringify(draft, null, 2)}
\`\`\`

Critica, regenera lo que falle el ICE ≥ 7, calcula score_madurez + benchmark, y devuelve el AuditResult final como JSON estricto.`;
}
