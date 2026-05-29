import { useEffect } from 'react';
import './Wizard.css';
import {
  useFormWizard,
  type StepIndex,
  type WizardValues,
} from './useFormWizard';
import ProgressDots from './ProgressDots';
import StepBusiness from './StepBusiness';
import StepContext from './StepContext';
import StepIdentity from './StepIdentity';
import StepContact from './StepContact';
import StepRecap from './StepRecap';

interface Props {
  onSubmit: (values: WizardValues) => void;
  disabled?: boolean;
}

export default function Wizard({ onSubmit, disabled }: Props): React.ReactElement {
  const wiz = useFormWizard();

  // Escape → previous step (when not disabled)
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && wiz.currentStep > 0) {
        wiz.goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, wiz]);

  const handleFormSubmit = (): void => {
    if (disabled) return;
    if (wiz.currentStep < 4) {
      if (wiz.canAdvance) wiz.goNext();
      return;
    }
    onSubmit(wiz.values);
  };

  const isOptional = wiz.isStepOptional(wiz.currentStep);
  const isLast = wiz.currentStep === 4;
  const isFirst = wiz.currentStep === 0;

  const renderStep = (): React.ReactElement => {
    switch (wiz.currentStep) {
      case 0:
        return (
          <StepBusiness
            value={wiz.values.input}
            onChange={(v) => wiz.setValue('input', v)}
          />
        );
      case 1:
        return (
          <StepContext
            industria={wiz.values.industria}
            equipo={wiz.values.equipo}
            stack={wiz.values.stack}
            pain={wiz.values.pain}
            onChange={(field, v) => wiz.setValue(field, v)}
          />
        );
      case 2:
        return (
          <StepIdentity
            nombre={wiz.values.nombre}
            empresa={wiz.values.empresa}
            onChange={(field, v) => wiz.setValue(field, v)}
          />
        );
      case 3:
        return (
          <StepContact
            email={wiz.values.email}
            telefono={wiz.values.telefono}
            onChange={(field, v) => wiz.setValue(field, v)}
          />
        );
      case 4:
        return <StepRecap values={wiz.values} onEdit={(s) => wiz.goTo(s)} />;
    }
  };

  return (
    <form
      className={`wiz${disabled ? ' is-disabled' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmit();
      }}
    >
      <ProgressDots
        currentStep={wiz.currentStep}
        totalSteps={wiz.totalSteps}
        visited={wiz.visited}
        onJumpTo={(s: StepIndex) => wiz.goTo(s)}
      />

      <div className="wiz-stage">
        <div
          key={wiz.currentStep}
          className={`wiz-step-wrapper is-${wiz.direction}`}
        >
          {renderStep()}
        </div>
      </div>

      <footer className="wiz-footer">
        <div className="wiz-footer-left">
          {!isFirst && (
            <button
              type="button"
              className="wiz-btn wiz-btn-ghost"
              onClick={wiz.goPrev}
              disabled={disabled}
            >
              <svg
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
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Atrás
            </button>
          )}
        </div>

        <div className="wiz-footer-right">
          {isOptional && !isLast && (
            <button
              type="button"
              className="wiz-btn-link"
              onClick={wiz.goNext}
              disabled={disabled}
            >
              Saltar
            </button>
          )}
          <button
            type="submit"
            className="wiz-btn wiz-btn-primary"
            disabled={disabled || !wiz.canAdvance}
          >
            {isLast ? (
              <>
                <span className="wiz-btn-sparkle" aria-hidden="true">
                  ✦
                </span>
                Analizar mi negocio
              </>
            ) : (
              <>Siguiente</>
            )}
            <svg
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
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </form>
  );
}
