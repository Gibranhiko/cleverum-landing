import { useEffect, useMemo, useRef, useState } from 'react';
import './AiAuditTool.css';
import { site } from '~/content/site';
import { setAuditState } from '~/lib/auditState';
import { useTurnstile } from './audit/useTurnstile';
import { streamAudit, AuditHttpError } from './audit/streamAudit';
import type {
  AuditExtra,
  AuditResult as AuditResultType,
  IndustryClassification,
  Opportunity,
} from '~/lib/audit/types';
import AuditResult from './audit/AuditResult';

const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

interface PendingSubmit {
  input: string;
  extra: AuditExtra | undefined;
}

export default function AiAuditTool(): React.ReactElement {
  const { audit } = site;

  // --- form state -----------------------------------------------------
  const [input, setInput] = useState('');
  const [extraOpen, setExtraOpen] = useState(false);
  const [industria, setIndustria] = useState('');
  const [equipo, setEquipo] = useState('');
  const [stack, setStack] = useState('');
  const [pain, setPain] = useState('');

  // --- pipeline state -------------------------------------------------
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<string>('idle');
  const [industry, setIndustry] = useState<IndustryClassification | null>(null);
  const [thinkingText, setThinkingText] = useState('');
  const [draftOpps, setDraftOpps] = useState<Opportunity[] | null>(null);
  const [finalAudit, setFinalAudit] = useState<AuditResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSubmit | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // --- turnstile ------------------------------------------------------
  const { containerRef: tsContainerRef, execute: tsExecute, reset: tsReset, error: tsError } =
    useTurnstile(SITE_KEY, (token) => {
      if (pending) {
        void run(pending, token);
        setPending(null);
      }
    });

  // --- derived --------------------------------------------------------
  const len = input.length;
  const counterClass =
    len < audit.minInputLength
      ? 'is-low'
      : len < 400
        ? ''
        : len < 480
          ? 'is-warn'
          : 'is-error';
  const counterColor = len >= audit.maxInputLength ? 'is-error' : counterClass;
  const canSubmit =
    !running &&
    len >= audit.minInputLength &&
    len <= audit.maxInputLength &&
    Boolean(SITE_KEY);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (tsError === 'missing_site_key' || !SITE_KEY) {
      return 'Anti-bot no configurado todavía. Avísale a Gibran que falta TURNSTILE_SITE_KEY.';
    }
    return error;
  }, [error, tsError]);

  // --- handlers -------------------------------------------------------
  const submitAudit = (): void => {
    if (!canSubmit) return;
    setError(null);

    const trimmed = input.trim();
    if (trimmed.length < audit.minInputLength) {
      setError(`Mínimo ${audit.minInputLength} caracteres.`);
      return;
    }
    if (trimmed.length > audit.maxInputLength) {
      setError(`Máximo ${audit.maxInputLength} caracteres.`);
      return;
    }

    const extra: AuditExtra | undefined =
      industria || equipo || stack || pain
        ? {
            ...(industria && { industria }),
            ...(equipo && { equipo }),
            ...(stack && { stack }),
            ...(pain && { pain }),
          }
        : undefined;

    setRunning(true);
    setStage('verifying');
    setAuditState('processing');
    setPending({ input: trimmed, extra });
    tsExecute();
  };

  const run = async (
    sub: PendingSubmit,
    turnstileToken: string,
  ): Promise<void> => {
    try {
      await streamAudit(
        { input: sub.input, extra: sub.extra, turnstileToken },
        {
          onStatus: (s) => setStage(s.stage),
          onIndustry: (data) => setIndustry(data),
          onThinking: (t) => setThinkingText((prev) => prev + t.delta),
          onOpportunitiesDraft: (draft) => setDraftOpps(draft.oportunidades),
          onDone: (d) => {
            setFinalAudit(d.audit);
            setRunning(false);
            setStage('done');
          },
          onError: (err) => {
            setError(err.message);
            setRunning(false);
            setStage('error');
            setAuditState('idle');
          },
        },
      );
    } catch (err) {
      const msg =
        err instanceof AuditHttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Error desconocido.';
      setError(msg);
      setRunning(false);
      setStage('error');
      setAuditState('idle');
      tsReset();
    }
  };

  // Scroll result into view when it first appears
  useEffect(() => {
    if ((industry || finalAudit) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [industry !== null, finalAudit !== null]);

  const pickExample = (ex: string): void => {
    setInput(ex);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const showResult = running || stage === 'done' || industry !== null || error !== null;

  return (
    <div className="audit-card" aria-label="AI Audit Tool">
      <div className="audit-eyebrow">
        <span className="audit-eyebrow-dot" aria-hidden="true" />
        {audit.eyebrow}
      </div>

      <h2 className="audit-headline font-display">{audit.headline}</h2>

      <div className="audit-pitch">
        {audit.pitch.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <form
        className="audit-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitAudit();
        }}
      >
        <div className="audit-input-wrap">
          <textarea
            ref={textareaRef}
            className="audit-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={audit.inputPlaceholder}
            maxLength={audit.maxInputLength}
            minLength={audit.minInputLength}
            aria-label="Tu negocio en 1 línea o URL"
            rows={3}
            disabled={running}
          />
          <span className={`audit-counter ${counterColor}`} aria-live="polite">
            {len} / {audit.maxInputLength}
          </span>
        </div>

        <button
          type="submit"
          className="audit-submit"
          disabled={!canSubmit}
        >
          {running ? (
            <>
              <span className="audit-submit-spinner" aria-hidden="true" />
              {stage === 'classifying'
                ? 'Clasificando…'
                : stage === 'analyzing'
                  ? 'Analizando…'
                  : stage === 'critiquing'
                    ? 'Refinando…'
                    : stage === 'saving'
                      ? 'Guardando…'
                      : 'Verificando…'}
            </>
          ) : (
            audit.submitLabel
          )}
        </button>
      </form>

      <details
        className="audit-tip"
        open={extraOpen}
        onToggle={(e) => setExtraOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary>{audit.tip.title}</summary>
        <ul>
          {audit.tip.hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
        <div className="audit-examples" role="group" aria-label="Ejemplos rápidos">
          {audit.tip.examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pickExample(ex)}
              disabled={running}
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="audit-extra">
          <div className="audit-extra-title">Datos extra (opcional · mejora la precisión)</div>
          <div className="audit-extra-grid">
            <label>
              <span>Industria</span>
              <input
                type="text"
                value={industria}
                onChange={(e) => setIndustria(e.target.value)}
                maxLength={200}
                placeholder="ej. Ecommerce de moda"
                disabled={running}
              />
            </label>
            <label>
              <span>Equipo</span>
              <input
                type="text"
                value={equipo}
                onChange={(e) => setEquipo(e.target.value)}
                maxLength={200}
                placeholder="ej. 8 personas, 2 técnicas"
                disabled={running}
              />
            </label>
            <label>
              <span>Stack actual</span>
              <input
                type="text"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                maxLength={200}
                placeholder="ej. Shopify + Mailchimp + Google Sheets"
                disabled={running}
              />
            </label>
            <label>
              <span>Tu mayor dolor hoy</span>
              <input
                type="text"
                value={pain}
                onChange={(e) => setPain(e.target.value)}
                maxLength={200}
                placeholder="ej. Atiendo 100 chats al día a mano"
                disabled={running}
              />
            </label>
          </div>
        </div>
      </details>

      {/* Turnstile (invisible) */}
      <div ref={tsContainerRef} className="audit-turnstile" aria-hidden="true" />

      {errorMessage && !showResult && (
        <div className="audit-form-error" role="alert">
          {errorMessage}
        </div>
      )}

      {showResult && (
        <div ref={resultRef}>
          <AuditResult
            industry={industry}
            thinkingText={thinkingText}
            draftOpportunities={draftOpps}
            finalAudit={finalAudit}
            stage={stage}
            error={errorMessage}
          />
        </div>
      )}
    </div>
  );
}
