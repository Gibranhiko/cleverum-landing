import { useEffect, useRef } from 'react';
import { site } from '~/content/site';

interface Props {
  industria: string;
  equipo: string;
  stack: string;
  pain: string;
  onChange: (field: 'industria' | 'equipo' | 'stack' | 'pain', value: string) => void;
}

export default function StepContext({
  industria,
  equipo,
  stack,
  pain,
  onChange,
}: Props): React.ReactElement {
  const firstRef = useRef<HTMLInputElement>(null);
  const { audit } = site;

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  return (
    <div className="wiz-step">
      <header className="wiz-step-header">
        <h3 className="wiz-step-title">¿Quieres darnos más contexto?</h3>
        <p className="wiz-step-sub">
          Opcional, pero mientras más sepamos, mejor el análisis.
        </p>
      </header>

      <div className="wiz-grid">
        <label className="wiz-field">
          <span>{audit.fields.industria}</span>
          <input
            ref={firstRef}
            type="text"
            value={industria}
            onChange={(e) => onChange('industria', e.target.value)}
            maxLength={audit.maxFieldLength}
            placeholder="ej. Ecommerce de moda"
          />
        </label>
        <label className="wiz-field">
          <span>{audit.fields.equipo}</span>
          <input
            type="text"
            value={equipo}
            onChange={(e) => onChange('equipo', e.target.value)}
            maxLength={audit.maxFieldLength}
            placeholder="ej. 8 personas"
          />
        </label>
        <label className="wiz-field">
          <span>{audit.fields.stack}</span>
          <input
            type="text"
            value={stack}
            onChange={(e) => onChange('stack', e.target.value)}
            maxLength={audit.maxFieldLength}
            placeholder="ej. Shopify, Mailchimp"
          />
        </label>
        <label className="wiz-field">
          <span>{audit.fields.pain}</span>
          <input
            type="text"
            value={pain}
            onChange={(e) => onChange('pain', e.target.value)}
            maxLength={audit.maxFieldLength}
            placeholder="ej. 100 chats al día a mano"
          />
        </label>
      </div>
    </div>
  );
}
