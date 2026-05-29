import { useEffect, useRef, useState } from 'react';
import { site } from '~/content/site';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const ROTATION_INTERVAL_MS = 4000;

export default function StepBusiness({ value, onChange }: Props): React.ReactElement {
  const { audit } = site;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (value.trim().length > 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % audit.examples.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [value, audit.examples.length]);

  const placeholder =
    value.trim().length > 0
      ? audit.fields.inputPlaceholder
      : (audit.examples[placeholderIdx] ?? audit.fields.inputPlaceholder);

  const pickExample = (ex: string): void => {
    onChange(ex);
    textareaRef.current?.focus();
  };

  const len = value.length;
  const counterClass =
    len === 0
      ? ''
      : len < audit.minInputLength
        ? 'is-low'
        : len < 400
          ? ''
          : len < 480
            ? 'is-warn'
            : 'is-error';

  return (
    <div className="wiz-step">
      <header className="wiz-step-header">
        <h3 className="wiz-step-title">Cuéntame de tu negocio.</h3>
        <p className="wiz-step-sub">
          Pega la URL de tu web o describe tu negocio en 1-2 líneas.
        </p>
      </header>

      <div className="wiz-input-wrap">
        <textarea
          ref={textareaRef}
          className="wiz-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={audit.maxInputLength}
          rows={3}
          aria-label="Tu URL o describe tu negocio"
        />
        <span className={`wiz-counter ${counterClass}`} aria-live="polite">
          {len} / {audit.maxInputLength}
        </span>
      </div>

      <div className="wiz-examples" role="group" aria-label="Ejemplos rápidos">
        <span className="wiz-examples-label">Ejemplos:</span>
        {audit.examples.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => pickExample(ex)}
            className="wiz-example-chip"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
