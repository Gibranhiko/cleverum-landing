import { useEffect, useRef, useState } from 'react';
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
  } = props;

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
      {industry && (
        <div className="audit-result-industry">
          <div className="audit-result-stage-label">Industria detectada</div>
          <div className="audit-result-industry-name">{industry.industria}</div>
          <div className="audit-result-industry-sub">
            {industry.sub_vertical} · score inicial {industry.maturity_score}/10
          </div>
        </div>
      )}

      {thinkingText && !finalAudit && (
        <ThinkingStream text={thinkingText} stage={stage} />
      )}

      {opps && opps.length > 0 && (
        <>
          {negocio && (
            <div className="audit-result-negocio">
              <span className="audit-result-stage-label">Tu negocio</span>
              <p>{negocio}</p>
            </div>
          )}

          <div className="audit-result-stage-label audit-result-opps-label">
            Las 3 oportunidades · en orden de impacto
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
        <MaturityScore
          score={finalAudit.score_madurez}
          benchmark={finalAudit.benchmark}
        />
      )}

      {finalAudit && finalAudit.recomendacion_prioritaria && (
        <div className="audit-result-recomendacion">
          <div className="audit-result-stage-label">Mi recomendación</div>
          <p>{finalAudit.recomendacion_prioritaria.razon}</p>
        </div>
      )}

      {finalAudit && emailProvidedUpfront && (
        <EmailStatusBanner emailStatus={emailStatus} emailUsed={emailUsed} />
      )}

      {finalAudit && !emailProvidedUpfront && (
        <MiniEmailGate auditId={finalAudit.audit_id} />
      )}
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
        <span className="audit-email-banner-icon" aria-hidden="true">✓</span>
        <p>
          Reporte enviado a <strong>{emailUsed}</strong>. Revisa también spam.
        </p>
      </div>
    );
  }
  if (emailStatus === 'failed') {
    return (
      <div className="audit-email-banner is-error" role="alert">
        <span className="audit-email-banner-icon" aria-hidden="true">!</span>
        <p>
          Hubo un problema al enviarte el reporte a <strong>{emailUsed}</strong>.
          Tu diagnóstico quedó guardado, escríbeme por WhatsApp y te lo paso a mano.
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
          ? 'Cleverum AI · refinando'
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

function OpportunityCard({
  opportunity: o,
  index,
  prioritaria,
}: {
  opportunity: Opportunity;
  index: number;
  prioritaria: boolean;
}): React.ReactElement {
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
      <p className="audit-opp-porque">{o.porque}</p>

      <div className="audit-opp-stack">
        {o.stack_recomendado.map((tech, j) => (
          <span key={j} className="audit-opp-chip">
            {tech}
          </span>
        ))}
      </div>

      <dl className="audit-opp-meta">
        <div>
          <dt>Retorno</dt>
          <dd>{o.roi_estimado}</dd>
        </div>
        <div>
          <dt>Tiempo</dt>
          <dd>{o.tiempo_implementacion}</dd>
        </div>
        <div>
          <dt>Complejidad</dt>
          <dd>{o.complejidad}</dd>
        </div>
        <div>
          <dt>Proyecto</dt>
          <dd>{SERVICE_NAME[o.sprint_recomendado] ?? o.sprint_recomendado}</dd>
        </div>
      </dl>

      <div className="audit-opp-ice" aria-label="Puntaje de la oportunidad">
        <span className="audit-opp-ice-label">Puntaje</span>
        <IceBar label="Impacto" value={o.ice_score.impact} />
        <IceBar label="Confianza" value={o.ice_score.confidence} />
        <IceBar label="Facilidad" value={o.ice_score.ease} />
        <span className="audit-opp-ice-avg">∅ {o.ice_score.promedio.toFixed(1)}</span>
      </div>

      <div className="audit-opp-confianza">Qué tan seguro estoy: {o.confianza}/100</div>
    </article>
  );
}

function IceBar({ label, value }: { label: string; value: number }): React.ReactElement {
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div className="audit-ice-bar">
      <span className="audit-ice-bar-label">{label}</span>
      <div className="audit-ice-bar-track">
        <div className="audit-ice-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="audit-ice-bar-value">{value}</span>
    </div>
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
      <div className="audit-result-stage-label">Madurez digital</div>
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
        <span className="audit-email-banner-icon" aria-hidden="true">✓</span>
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
        <p>
          Lo mando con tecnologías, retorno esperado y un plan de cómo arrancar.
          Sin spam.
        </p>
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
        <button
          type="submit"
          disabled={sending || !isValid}
        >
          {sending ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>

      {error && <div className="audit-mini-gate-error">{error}</div>}
    </form>
  );
}
