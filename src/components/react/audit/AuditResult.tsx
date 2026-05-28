import { useEffect, useRef, useState } from 'react';
import './AuditResult.css';
import type {
  AuditResult as AuditResultType,
  IndustryClassification,
  Opportunity,
} from '~/lib/audit/types';
import { setAuditState } from '~/lib/auditState';

interface Props {
  industry: IndustryClassification | null;
  thinkingText: string;
  draftOpportunities: Opportunity[] | null;
  finalAudit: AuditResultType | null;
  stage: string;
  error: string | null;
}

const SPRINT_NAME: Record<string, string> = {
  web: 'Sprint Web',
  auto: 'Sprint Automatización IA',
  chatbot: 'Sprint Chatbot WhatsApp',
};

const SPRINT_PRICE: Record<string, string> = {
  web: 'desde $25,000 MXN',
  auto: 'desde $35,000 MXN',
  chatbot: 'desde $45,000 MXN',
};

export default function AuditResult(props: Props): React.ReactElement {
  const { industry, thinkingText, draftOpportunities, finalAudit, stage, error } = props;

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

      {finalAudit && <EmailGate auditId={finalAudit.audit_id} />}
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
          {o.categoria === 'quick-win' ? 'Quick Win' : 'Strategic Bet'}
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
          <dt>ROI</dt>
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
          <dt>Sprint</dt>
          <dd>
            {SPRINT_NAME[o.sprint_recomendado] ?? o.sprint_recomendado}
            <span className="audit-opp-price"> ({SPRINT_PRICE[o.sprint_recomendado] ?? '?'})</span>
          </dd>
        </div>
      </dl>

      <div className="audit-opp-ice" aria-label="ICE score">
        <span className="audit-opp-ice-label">ICE</span>
        <IceBar label="Impact" value={o.ice_score.impact} />
        <IceBar label="Confidence" value={o.ice_score.confidence} />
        <IceBar label="Ease" value={o.ice_score.ease} />
        <span className="audit-opp-ice-avg">∅ {o.ice_score.promedio.toFixed(1)}</span>
      </div>

      <div className="audit-opp-confianza">Confianza: {o.confianza}/100</div>
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
      <div className="audit-result-stage-label">Score de madurez digital</div>
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

function EmailGate({ auditId }: { auditId: string }): React.ReactElement {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [como, setComo] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendLead = async (): Promise<void> => {
    setError(null);
    if (sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre,
          audit_id: auditId,
          comoMeEncontraste: como || undefined,
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
      <div className="audit-gate audit-gate-success" role="status">
        <h3>¡Listo, {nombre}!</h3>
        <p>
          Te llegó el reporte detallado a <strong>{email}</strong>. Revisa también spam.
        </p>
        <p className="audit-gate-cta">
          ¿Quieres aterrizar la oportunidad #1 conmigo? Agenda 20 min gratis:
        </p>
        <a
          href="https://cleverum.org/#contacto"
          className="audit-gate-button audit-gate-button-primary"
        >
          Ver opciones de contacto
        </a>
      </div>
    );
  }

  return (
    <form
      className="audit-gate"
      onSubmit={(e) => {
        e.preventDefault();
        void sendLead();
      }}
      aria-label="Recibir reporte detallado"
    >
      <h3>Recibe la propuesta detallada por email</h3>
      <p>
        Te mando el reporte completo con stack, ROI y plan de implementación. Sin spam.
      </p>

      <div className="audit-gate-row">
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            required
            maxLength={200}
            autoComplete="email"
          />
        </label>
        <label>
          <span>Nombre</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            minLength={2}
            maxLength={100}
            autoComplete="given-name"
          />
        </label>
      </div>

      <label className="audit-gate-como">
        <span>¿Cómo me encontraste? (opcional)</span>
        <input
          type="text"
          value={como}
          onChange={(e) => setComo(e.target.value)}
          placeholder="LinkedIn, recomendación, Google..."
          maxLength={200}
          autoComplete="off"
        />
      </label>

      {error && <div className="audit-gate-error">{error}</div>}

      <button
        type="submit"
        disabled={sending || !email || nombre.length < 2}
        className="audit-gate-button audit-gate-button-primary"
      >
        {sending ? 'Enviando…' : 'Recibir propuesta detallada'}
      </button>
    </form>
  );
}
