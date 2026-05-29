import { useEffect, useMemo, useRef, useState } from 'react';
import './AiAuditTool.css';
import { setAuditState } from '~/lib/auditState';
import { useTurnstile } from './audit/useTurnstile';
import { streamAudit, AuditHttpError } from './audit/streamAudit';
import type {
  AuditContact,
  AuditExtra,
  AuditResult as AuditResultType,
  IndustryClassification,
  Opportunity,
} from '~/lib/audit/types';
import AuditResult from './audit/AuditResult';
import Wizard from './audit/wizard/Wizard';
import type { WizardValues } from './audit/wizard/useFormWizard';

const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

interface PendingSubmit {
  input: string;
  extra: AuditExtra | undefined;
  contact: AuditContact;
}

type EmailStatus = 'pending' | 'sent' | 'failed' | 'no_email';

export default function AiAuditTool(): React.ReactElement {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<string>('idle');
  const [industry, setIndustry] = useState<IndustryClassification | null>(null);
  const [thinkingText, setThinkingText] = useState('');
  const [draftOpps, setDraftOpps] = useState<Opportunity[] | null>(null);
  const [finalAudit, setFinalAudit] = useState<AuditResultType | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSubmit | null>(null);
  const [submitted, setSubmitted] = useState<WizardValues | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const { containerRef: tsContainerRef, execute: tsExecute, reset: tsReset, error: tsError } =
    useTurnstile(SITE_KEY, (token) => {
      if (pending) {
        void run(pending, token);
        setPending(null);
      }
    });

  const handleWizardSubmit = (values: WizardValues): void => {
    if (!SITE_KEY) {
      setError(
        'Anti-bot no configurado. Avísale a Gibran que falta TURNSTILE_SITE_KEY.',
      );
      return;
    }

    const extra: AuditExtra | undefined =
      values.industria || values.equipo || values.stack || values.pain
        ? {
            ...(values.industria.trim() && { industria: values.industria.trim() }),
            ...(values.equipo.trim() && { equipo: values.equipo.trim() }),
            ...(values.stack.trim() && { stack: values.stack.trim() }),
            ...(values.pain.trim() && { pain: values.pain.trim() }),
          }
        : undefined;

    const contact: AuditContact = {
      nombre: values.nombre.trim(),
      empresa: values.empresa.trim(),
      ...(values.email.trim() && { email: values.email.trim() }),
      ...(values.telefono.trim() && { telefono: values.telefono.trim() }),
    };

    setSubmitted(values);
    setError(null);
    setRunning(true);
    setStage('verifying');
    setAuditState('processing');
    setPending({ input: values.input.trim(), extra, contact });
    tsExecute();
  };

  const run = async (
    sub: PendingSubmit,
    turnstileToken: string,
  ): Promise<void> => {
    try {
      await streamAudit(
        {
          input: sub.input,
          extra: sub.extra,
          contact: sub.contact,
          turnstileToken,
        },
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
          onEmailStatus: (data) => {
            if (data.sent) setEmailStatus('sent');
            else if (data.reason === 'no_email') setEmailStatus('no_email');
            else setEmailStatus('failed');
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

  useEffect(() => {
    if ((industry || finalAudit) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [industry !== null, finalAudit !== null]);

  const auditStarted = running || industry !== null || finalAudit !== null;
  const showWizard = !auditStarted && !error;
  const showResult = auditStarted || error !== null;

  const emailProvidedUpfront = Boolean(submitted?.email.trim());
  const emailUsed = submitted?.email.trim() ?? '';

  const formErrorMessage = useMemo(() => {
    if (!error) return null;
    if (tsError === 'missing_site_key' || !SITE_KEY) {
      return 'Anti-bot no configurado. Avísale a Gibran que falta TURNSTILE_SITE_KEY.';
    }
    return error;
  }, [error, tsError]);

  const stageLabel = useMemo(() => {
    switch (stage) {
      case 'classifying':
        return 'Cleverum AI · clasificando';
      case 'analyzing':
        return 'Cleverum AI · pensando';
      case 'critiquing':
        return 'Cleverum AI · refinando';
      case 'saving':
        return 'Guardando';
      case 'done':
        return 'Análisis completo';
      case 'error':
        return 'Error';
      default:
        return 'Verificando';
    }
  }, [stage]);

  return (
    <div className="audit-card" aria-label="Diagnóstico inteligente">
      {showWizard && (
        <Wizard onSubmit={handleWizardSubmit} disabled={running} />
      )}

      {!showWizard && submitted && (
        <div className="audit-summary" role="status">
          <div className="audit-summary-stage">
            <span className="audit-summary-dot" aria-hidden="true" />
            <span>{stageLabel}</span>
          </div>
          <div className="audit-summary-text">
            <strong>
              {submitted.nombre}
              {submitted.empresa ? ` · ${submitted.empresa}` : ''}
            </strong>
            {submitted.input && (
              <span className="audit-summary-business">
                {submitted.input.length > 90
                  ? `${submitted.input.slice(0, 90)}…`
                  : submitted.input}
              </span>
            )}
          </div>
        </div>
      )}

      <div ref={tsContainerRef} className="audit-turnstile" aria-hidden="true" />

      {formErrorMessage && !auditStarted && (
        <div className="audit-form-error" role="alert">
          {formErrorMessage}
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
            error={formErrorMessage}
            emailProvidedUpfront={emailProvidedUpfront}
            emailUsed={emailUsed}
            emailStatus={emailStatus}
          />
        </div>
      )}
    </div>
  );
}
