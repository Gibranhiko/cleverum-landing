import { useEffect, useRef } from 'react';
import { site } from '~/content/site';
import { isValidEmailFormat, isValidPhoneFormat } from './useFormWizard';

interface Props {
  email: string;
  telefono: string;
  onChange: (field: 'email' | 'telefono', value: string) => void;
}

export default function StepContact({
  email,
  telefono,
  onChange,
}: Props): React.ReactElement {
  const firstRef = useRef<HTMLInputElement>(null);
  const { audit } = site;

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const emailError = email.trim() !== '' && !isValidEmailFormat(email);
  const phoneError = telefono.trim() !== '' && !isValidPhoneFormat(telefono);

  return (
    <div className="wiz-step">
      <header className="wiz-step-header">
        <h3 className="wiz-step-title">¿Cómo te enviamos el reporte detallado?</h3>
        <p className="wiz-step-sub">
          Si nos dejas tu email, te lo enviamos al terminar. Si no, lo ves aquí mismo.
        </p>
      </header>

      <div className="wiz-grid">
        <label className="wiz-field">
          <span>{audit.fields.email}</span>
          <input
            ref={firstRef}
            type="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            maxLength={200}
            placeholder="tu@empresa.com"
            autoComplete="email"
            aria-invalid={emailError}
          />
          {emailError && (
            <span className="wiz-field-error">Email no parece válido.</span>
          )}
        </label>
        <label className="wiz-field">
          <span>{audit.fields.telefono}</span>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => onChange('telefono', e.target.value)}
            maxLength={25}
            placeholder="+52 ..."
            autoComplete="tel"
            aria-invalid={phoneError}
          />
          {phoneError && (
            <span className="wiz-field-error">
              Solo números, mínimo 7 dígitos.
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
