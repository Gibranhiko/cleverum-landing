import { useEffect, useRef } from 'react';
import { site } from '~/content/site';

interface Props {
  nombre: string;
  empresa: string;
  onChange: (field: 'nombre' | 'empresa', value: string) => void;
}

export default function StepIdentity({ nombre, empresa, onChange }: Props): React.ReactElement {
  const firstRef = useRef<HTMLInputElement>(null);
  const { audit } = site;

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const nombreTrim = nombre.trim();
  const empresaTrim = empresa.trim();
  const nombreError = nombreTrim.length > 0 && nombreTrim.length < 2;
  const empresaError = empresaTrim.length > 0 && empresaTrim.length < 2;

  return (
    <div className="wiz-step">
      <header className="wiz-step-header">
        <h3 className="wiz-step-title">¿Quién eres?</h3>
        <p className="wiz-step-sub">
          Lo usamos para personalizar tu reporte. Solo nosotros lo vemos.
        </p>
      </header>

      <div className="wiz-grid">
        <label className="wiz-field">
          <span>
            {audit.fields.nombre} <em className="wiz-required">*</em>
          </span>
          <input
            ref={firstRef}
            type="text"
            value={nombre}
            onChange={(e) => onChange('nombre', e.target.value)}
            maxLength={100}
            required
            placeholder="Tu nombre"
            autoComplete="given-name"
            aria-invalid={nombreError}
          />
          {nombreError && <span className="wiz-field-error">Mínimo 2 caracteres.</span>}
        </label>
        <label className="wiz-field">
          <span>
            {audit.fields.empresa} <em className="wiz-required">*</em>
          </span>
          <input
            type="text"
            value={empresa}
            onChange={(e) => onChange('empresa', e.target.value)}
            maxLength={100}
            required
            placeholder="Nombre de tu empresa"
            autoComplete="organization"
            aria-invalid={empresaError}
          />
          {empresaError && <span className="wiz-field-error">Mínimo 2 caracteres.</span>}
        </label>
      </div>
    </div>
  );
}
