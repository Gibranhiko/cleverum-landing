import { useEffect, useMemo, useRef, useState } from 'react';
import './AuditResult.css';
import type {
  AuditResult as AuditResultType,
  IndustryClassification,
  Opportunity,
} from '~/lib/audit/types';
import { setAuditState } from '~/lib/auditState';

type EmailStatus = 'pending' | 'sent' | 'failed' | 'no_email';

interface Props {
  industry: IndustryClassification | null;
  thinkingText: string;
  draftOpportunities: Opportunity[] | null;
  finalAudit: AuditResultType | null;
  stage: string;
  error: string | null;
  emailProvidedUpfront: boolean;
  emailUsed: string;
  emailStatus: EmailStatus;
  clientName?: string;
  clientCompany?: string;
}

const SERVICE_NAME: Record<string, string> = {
  web: 'Sitio web',
  auto: 'Automatización con IA',
  chatbot: 'Chatbot de WhatsApp',
};

export default function AuditResult(props: Props): React.ReactElement {
  const {
    industry,
    thinkingText,
    draftOpportunities,
    finalAudit,
    stage,
    error,
    emailProvidedUpfront,
    emailUsed,
    emailStatus,
    clientName,
    clientCompany,
  } = props;

  const [pdfState, setPdfState] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleDownloadPdf = async (): Promise<void> => {
    if (!finalAudit || pdfState === 'loading') return;
    setPdfState('loading');
    try {
      const { downloadAuditPdf } = await import('./auditPdf');
      await downloadAuditPdf(finalAudit, { nombre: clientName, empresa: clientCompany });
      setPdfState('idle');
    } catch {
      setPdfState('error');
    }
  };

  // Dispatch audit state based on stream progress
  const dispatchedRevealing = useRef(false);
  const dispatchedDone = useRef(false);

  useEffect(() => {
    if (draftOpportunities && draftOpportunities.length > 0 && !dispatchedRevealing.current) {
      dispatchedRevealing.current = true;
      setAuditState('revealing');
    }
  }, [draftOpportunities]);

  useEffect(() => {
    if (finalAudit && !dispatchedDone.current) {
      dispatchedDone.current = true;
      setAuditState('done', { score: finalAudit.score_madurez });
      const t = setTimeout(() => setAuditState('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [finalAudit]);

  if (error) {
    return (
      <div className="audit-result audit-result-error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  const opps = finalAudit?.oportunidades ?? draftOpportunities;
  const negocio = finalAudit?.negocio_detectado;

  return (
    <div className="audit-result" aria-live="polite">
      {!finalAudit && <ProcessingPanel stage={stage} industry={industry} emailUsed={emailUsed} />}

      {industry && (
        <div className="audit-result-industry">
          <div className="audit-result-stage-label">Industria detectada</div>
          <div className="audit-result-industry-name">{industry.industria}</div>
          <div className="audit-result-industry-sub">
            {industry.sub_vertical} · nivel de automatización {industry.maturity_score}/10
          </div>
        </div>
      )}

      {thinkingText && !finalAudit && <ThinkingStream text={thinkingText} stage={stage} />}

      {opps && opps.length > 0 && (
        <>
          {negocio && (
            <div className="audit-result-negocio">
              <span className="audit-result-stage-label">Tu negocio</span>
              <p>{negocio}</p>
            </div>
          )}

          <div className="audit-result-stage-label audit-result-opps-label">
            {opps.length === 1
              ? 'La oportunidad principal'
              : `Las ${opps.length} oportunidades · en orden de impacto`}
          </div>

          <div className="audit-result-opps">
            {opps.map((o, i) => (
              <OpportunityCard
                key={`${o.titulo}-${i}`}
                opportunity={o}
                index={i}
                prioritaria={finalAudit?.recomendacion_prioritaria.oportunidad_index === i}
              />
            ))}
          </div>
        </>
      )}

      {finalAudit && (
        <MaturityScore score={finalAudit.score_madurez} benchmark={finalAudit.benchmark} />
      )}

      {finalAudit && finalAudit.recomendacion_prioritaria && (
        <div className="audit-result-recomendacion">
          <div className="audit-result-stage-label">Nuestra recomendación</div>
          <p>{finalAudit.recomendacion_prioritaria.razon}</p>
        </div>
      )}

      {finalAudit && (
        <div className="audit-result-actions">
          <button
            type="button"
            className="audit-pdf-btn"
            onClick={() => void handleDownloadPdf()}
            disabled={pdfState === 'loading'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{pdfState === 'loading' ? 'Generando PDF…' : 'Descargar PDF'}</span>
          </button>
          {pdfState === 'error' && (
            <span className="audit-pdf-error" role="alert">
              No se pudo generar el PDF. Intenta de nuevo.
            </span>
          )}
        </div>
      )}

      {finalAudit && emailProvidedUpfront && (
        <EmailStatusBanner emailStatus={emailStatus} emailUsed={emailUsed} />
      )}

      {finalAudit && !emailProvidedUpfront && <MiniEmailGate auditId={finalAudit.audit_id} />}
    </div>
  );
}

function EmailStatusBanner({
  emailStatus,
  emailUsed,
}: {
  emailStatus: EmailStatus;
  emailUsed: string;
}): React.ReactElement {
  if (emailStatus === 'sent') {
    return (
      <div className="audit-email-banner is-success" role="status">
        <span className="audit-email-banner-icon" aria-hidden="true">
          ✓
        </span>
        <p>
          Reporte enviado a <strong>{emailUsed}</strong>. Revisa también spam.
        </p>
      </div>
    );
  }
  if (emailStatus === 'failed') {
    return (
      <div className="audit-email-banner is-error" role="alert">
        <span className="audit-email-banner-icon" aria-hidden="true">
          !
        </span>
        <p>
          Hubo un problema al enviarte el reporte a <strong>{emailUsed}</strong>. Tu diagnóstico
          quedó guardado, escríbeme por WhatsApp y te lo paso a mano.
        </p>
      </div>
    );
  }
  return (
    <div className="audit-email-banner is-pending" role="status">
      <span className="audit-email-banner-spinner" aria-hidden="true" />
      <p>
        Enviando el reporte detallado a <strong>{emailUsed}</strong>…
      </p>
    </div>
  );
}

/* ============================================================
 * Subcomponents
 * ========================================================== */

const STEPS = ['Leyendo tu negocio', 'Detectando industria', 'Analizando', 'Afinando'] as const;

function buildTips(industria?: string): string[] {
  const tips = [
    'Leyendo tu negocio a fondo…',
    'Cruzando con 15 patrones de automatización reales…',
    'Calculando el retorno de cada oportunidad…',
    'Priorizando por impacto, confianza y facilidad…',
    'Afinando las ideas para tu caso específico…',
  ];
  if (industria) {
    tips.splice(2, 0, `Comparando con otros negocios de ${industria}…`);
  }
  return tips;
}

function ProcessingPanel({
  stage,
  industry,
  emailUsed,
}: {
  stage: string;
  industry: IndustryClassification | null;
  emailUsed: string;
}): React.ReactElement {
  const tips = useMemo(() => buildTips(industry?.industria), [industry?.industria]);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    setTipIdx(0);
    const id = setInterval(() => {
      setTipIdx((i) => (i + 1) % tips.length);
    }, 2600);
    return () => clearInterval(id);
  }, [tips]);

  const active =
    stage === 'critiquing' || stage === 'saving'
      ? 3
      : stage === 'analyzing'
        ? 2
        : industry || stage === 'classifying'
          ? 1
          : 0;

  return (
    <div className="audit-processing">
      <div className="audit-orb" aria-hidden="true">
        <span className="audit-orb-core" />
        <span className="audit-orb-ring" />
      </div>

      <p className="audit-tip" key={tipIdx}>
        {tips[tipIdx]}
      </p>

      <ol className="audit-steps" aria-label="Progreso del diagnóstico">
        {STEPS.map((label, i) => {
          const state = i < active ? 'is-done' : i === active ? 'is-active' : '';
          return (
            <li key={label} className={`audit-step ${state}`}>
              <span className="audit-step-marker" aria-hidden="true">
                {i < active ? '✓' : i + 1}
              </span>
              <span className="audit-step-label">{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="audit-leave-banner" role="note">
        <svg
          className="audit-leave-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <p className="audit-leave-text">
          {emailUsed ? (
            <>
              ¿Sin tiempo? Cierra la pestaña — el resultado llega a <strong>{emailUsed}</strong> al
              terminar.
            </>
          ) : (
            <>¿Sin tiempo? Cierra la pestaña — el resultado llega a tu correo al terminar.</>
          )}
        </p>
      </div>
    </div>
  );
}

function ThinkingStream({ text, stage }: { text: string; stage: string }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [text]);

  const label =
    stage === 'classifying'
      ? 'Cleverum AI · clasificando'
      : stage === 'analyzing'
        ? 'Cleverum AI · pensando'
        : stage === 'critiquing'
          ? 'Cleverum AI · afinando'
          : 'Cleverum AI · procesando';

  return (
    <div className="audit-thinking" aria-label="Análisis en curso">
      <div className="audit-thinking-header">
        <span className="audit-thinking-dot" aria-hidden="true" />
        <span className="audit-thinking-label">{label}</span>
      </div>
      <div className="audit-thinking-stream" ref={ref}>
        {text}
        <span className="audit-thinking-cursor" aria-hidden="true">
          ▋
        </span>
      </div>
    </div>
  );
}

function impactoWord(n: number): string {
  return n >= 8 ? 'alto' : n >= 6 ? 'medio' : 'bajo';
}

function recomendacionWord(promedio: number): string {
  return promedio >= 8 ? 'Muy recomendada' : promedio >= 7 ? 'Recomendada' : 'Con potencial';
}

function OpportunityCard({
  opportunity: o,
  index,
  prioritaria,
}: {
  opportunity: Opportunity;
  index: number;
  prioritaria: boolean;
}): React.ReactElement {
  const [showTools, setShowTools] = useState(false);
  const impacto = impactoWord(o.ice_score.impact);

  return (
    <article
      className={`audit-opp ${prioritaria ? 'is-prioritaria' : ''}`}
      style={{ '--reveal-delay': `${index * 0.12}s` } as React.CSSProperties}
    >
      <header className="audit-opp-header">
        <span className="audit-opp-badge">
          {o.categoria === 'quick-win' ? 'Ganancia rápida' : 'Apuesta estratégica'}
        </span>
        <span className="audit-opp-index">{String(index + 1).padStart(2, '0')}</span>
      </header>

      <h3 className="audit-opp-title">{o.titulo}</h3>

      {o.en_corto && <p className="audit-opp-encorto">{o.en_corto}</p>}

      <p className="audit-opp-porque">{o.porque}</p>

      <div className="audit-opp-signals">
        <span className={`audit-opp-signal is-impacto-${impacto}`}>Impacto {impacto}</span>
        <span className="audit-opp-signal is-reco">{recomendacionWord(o.ice_score.promedio)}</span>
      </div>

      <dl className="audit-opp-meta">
        <div>
          <dt>Lo que ganas</dt>
          <dd>{o.roi_estimado}</dd>
        </div>
        <div>
          <dt>Tiempo</dt>
          <dd>{o.tiempo_implementacion}</dd>
        </div>
        <div>
          <dt>Esfuerzo</dt>
          <dd>{o.complejidad}</dd>
        </div>
        <div>
          <dt>Servicio</dt>
          <dd>{SERVICE_NAME[o.sprint_recomendado] ?? o.sprint_recomendado}</dd>
        </div>
      </dl>

      <div className="audit-opp-tools">
        <button
          type="button"
          className="audit-opp-tools-toggle"
          onClick={() => setShowTools((v) => !v)}
          aria-expanded={showTools}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={showTools ? 'is-open' : ''}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {showTools ? 'Ocultar herramientas' : 'Ver herramientas'}
        </button>
        {showTools && (
          <div className="audit-opp-stack">
            {o.stack_recomendado.map((tech, j) => (
              <span key={j} className="audit-opp-chip">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function MaturityScore({
  score,
  benchmark,
}: {
  score: number;
  benchmark: AuditResultType['benchmark'];
}): React.ReactElement {
  const max = 10;
  const scorePct = (score / max) * 100;
  const promedioPct = (benchmark.industria_promedio / max) * 100;
  const liderPct = (benchmark.lider / max) * 100;
  const potencialPct = (benchmark.tu_potencial / max) * 100;

  return (
    <section className="audit-maturity">
      <div className="audit-result-stage-label">Qué tan automatizado estás hoy</div>
      <div className="audit-maturity-value">
        <span className="audit-maturity-score-big">{score}</span>
        <span className="audit-maturity-score-max">/{max}</span>
      </div>

      <div className="audit-maturity-track" aria-hidden="true">
        <div className="audit-maturity-fill" style={{ width: `${scorePct}%` }} />
        <div
          className="audit-maturity-marker audit-maturity-marker-avg"
          style={{ left: `${promedioPct}%` }}
          title="Promedio industria"
        />
        <div
          className="audit-maturity-marker audit-maturity-marker-leader"
          style={{ left: `${liderPct}%` }}
          title="Líder de industria"
        />
        <div
          className="audit-maturity-marker audit-maturity-marker-potencial"
          style={{ left: `${potencialPct}%` }}
          title="Tu potencial"
        />
      </div>

      <ul className="audit-maturity-legend">
        <li>
          <span className="dot dot-you" /> Tú: {score}
        </li>
        <li>
          <span className="dot dot-avg" /> Industria promedio: {benchmark.industria_promedio}
        </li>
        <li>
          <span className="dot dot-leader" /> Líder: {benchmark.lider}
        </li>
        <li>
          <span className="dot dot-potencial" /> Tu potencial: {benchmark.tu_potencial}
        </li>
      </ul>
    </section>
  );
}

function MiniEmailGate({ auditId }: { auditId: string }): React.ReactElement {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const sendLead = async (): Promise<void> => {
    setError(null);
    if (sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          audit_id: auditId,
        }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setError(body.message ?? 'No pude enviar el reporte. Intenta de nuevo.');
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Error de red. Intenta de nuevo.');
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="audit-email-banner is-success" role="status">
        <span className="audit-email-banner-icon" aria-hidden="true">
          ✓
        </span>
        <p>
          Reporte enviado a <strong>{email.trim()}</strong>. Revisa también spam.
        </p>
      </div>
    );
  }

  return (
    <form
      className="audit-mini-gate"
      onSubmit={(e) => {
        e.preventDefault();
        void sendLead();
      }}
      aria-label="Recibir reporte detallado por email"
    >
      <div className="audit-mini-gate-text">
        <h3>¿Quieres el reporte detallado por email?</h3>
        <p>Lo mando con tecnologías, retorno esperado y un plan de cómo arrancar. Sin spam.</p>
      </div>

      <div className="audit-mini-gate-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          required
          maxLength={200}
          autoComplete="email"
          aria-label="Email"
        />
        <button type="submit" disabled={sending || !isValid}>
          {sending ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>

      {error && <div className="audit-mini-gate-error">{error}</div>}
    </form>
  );
}
