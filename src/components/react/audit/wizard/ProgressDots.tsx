import type { StepIndex } from './useFormWizard';

interface Props {
  currentStep: StepIndex;
  totalSteps: number;
  visited: Set<number>;
  onJumpTo: (step: StepIndex) => void;
}

export default function ProgressDots({
  currentStep,
  totalSteps,
  visited,
  onJumpTo,
}: Props): React.ReactElement {
  return (
    <div className="wiz-progress">
      <div
        className="wiz-progress-dots"
        role="progressbar"
        aria-valuemin={1}
        aria-valuenow={currentStep + 1}
        aria-valuemax={totalSteps}
        aria-label={`Paso ${currentStep + 1} de ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepIdx = i as StepIndex;
          const isActive = i === currentStep;
          const isCompleted = visited.has(i) && i < currentStep;
          const isClickable = isCompleted;
          return (
            <button
              key={i}
              type="button"
              className={`wiz-dot${isActive ? ' is-active' : ''}${isCompleted ? ' is-completed' : ''}`}
              aria-label={
                isCompleted
                  ? `Paso ${i + 1} completado — click para editar`
                  : isActive
                    ? `Paso ${i + 1} actual`
                    : `Paso ${i + 1}`
              }
              aria-current={isActive ? 'step' : undefined}
              disabled={!isClickable}
              tabIndex={isClickable ? 0 : -1}
              onClick={() => isClickable && onJumpTo(stepIdx)}
            >
              {isCompleted && (
                <svg
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <div className="wiz-progress-label">
        Paso {currentStep + 1} de {totalSteps}
      </div>
    </div>
  );
}
