import type { StepIndex, WizardValues } from './useFormWizard';

interface Props {
  values: WizardValues;
  onEdit: (step: StepIndex) => void;
}

export default function StepRecap({ values, onEdit }: Props): React.ReactElement {
  const contextFields: { label: string; value: string }[] = [
    { label: 'Industria', value: values.industria },
    { label: 'Equipo', value: values.equipo },
    { label: 'Herramientas', value: values.stack },
    { label: 'Mayor dolor', value: values.pain },
  ];
  const filledContext = contextFields.filter((f) => f.value.trim() !== '');
  const emptyCount = contextFields.length - filledContext.length;

  return (
    <div className="wiz-step">
      <header className="wiz-step-header">
        <h3 className="wiz-step-title">Listo, voy a analizar esto.</h3>
        <p className="wiz-step-sub">Tarda ~30 segundos. Quédate aquí.</p>
      </header>

      <div className="wiz-recap-list">
        <RecapBlock label="Tu negocio" onEdit={() => onEdit(0)}>
          <p>{values.input}</p>
        </RecapBlock>

        <RecapBlock label="Contexto extra" onEdit={() => onEdit(1)}>
          {filledContext.length === 0 ? (
            <p className="wiz-recap-muted">No agregaste contexto extra</p>
          ) : (
            <ul>
              {filledContext.map((f) => (
                <li key={f.label}>
                  <span className="wiz-recap-key">{f.label}:</span> {f.value}
                </li>
              ))}
              {emptyCount > 0 && (
                <li className="wiz-recap-muted">
                  · {emptyCount} {emptyCount === 1 ? 'campo' : 'campos'} sin llenar
                </li>
              )}
            </ul>
          )}
        </RecapBlock>

        <RecapBlock label="Tu identidad" onEdit={() => onEdit(2)}>
          <p>
            <strong>{values.nombre}</strong> · {values.empresa}
          </p>
        </RecapBlock>

        <RecapBlock label="Contacto" onEdit={() => onEdit(3)}>
          <ul>
            {values.email.trim() ? (
              <li>
                <span className="wiz-recap-check" aria-hidden="true">
                  ✓
                </span>
                {values.email.trim()}
              </li>
            ) : (
              <li className="wiz-recap-muted">
                · Sin email — verás el resultado solo en pantalla
              </li>
            )}
            {values.telefono.trim() ? (
              <li>
                <span className="wiz-recap-check" aria-hidden="true">
                  ✓
                </span>
                {values.telefono.trim()}
              </li>
            ) : (
              <li className="wiz-recap-muted">· Sin teléfono</li>
            )}
          </ul>
        </RecapBlock>
      </div>
    </div>
  );
}

function RecapBlock({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="wiz-recap-block">
      <header className="wiz-recap-header">
        <span className="wiz-recap-label">{label}</span>
        <button
          type="button"
          onClick={onEdit}
          className="wiz-recap-edit"
          aria-label={`Editar ${label}`}
        >
          Editar
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </header>
      <div className="wiz-recap-body">{children}</div>
    </section>
  );
}
