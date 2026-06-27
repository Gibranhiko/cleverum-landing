import { useCallback, useMemo, useState } from 'react';
import { site } from '~/content/site';

export type StepIndex = 0 | 1 | 2 | 3 | 4;
export type WizardDirection = 'forward' | 'backward';

export interface WizardValues {
  input: string;
  industria: string;
  equipo: string;
  stack: string;
  pain: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
}

export const TOTAL_STEPS = 5;

const INITIAL_VALUES: WizardValues = {
  input: '',
  industria: '',
  equipo: '',
  stack: '',
  pain: '',
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
};

export function isValidEmailFormat(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function isValidPhoneFormat(v: string): boolean {
  const cleaned = v.replace(/[\s\-+().]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 20 && /^\d+$/.test(cleaned);
}

function validateStep(
  step: StepIndex,
  values: WizardValues,
  minInput: number,
  maxInput: number,
): boolean {
  switch (step) {
    case 0: {
      const len = values.input.trim().length;
      return len >= minInput && len <= maxInput;
    }
    case 1:
      return true;
    case 2:
      return (
        values.nombre.trim().length >= 2 && values.empresa.trim().length >= 2
      );
    case 3: {
      // Email obligatorio: así podemos enviarle el reporte aunque abandone.
      const emailOk = isValidEmailFormat(values.email);
      const phoneOk =
        values.telefono.trim() === '' || isValidPhoneFormat(values.telefono);
      return emailOk && phoneOk;
    }
    case 4:
      return true;
    default:
      return false;
  }
}

export interface UseFormWizardResult {
  currentStep: StepIndex;
  totalSteps: number;
  values: WizardValues;
  visited: Set<number>;
  direction: WizardDirection;
  canAdvance: boolean;
  isStepOptional: (step: StepIndex) => boolean;
  setValue: <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => void;
  goNext: () => void;
  goPrev: () => void;
  goTo: (step: StepIndex) => void;
  reset: () => void;
}

export function useFormWizard(): UseFormWizardResult {
  const { audit } = site;
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [values, setValues] = useState<WizardValues>(INITIAL_VALUES);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [direction, setDirection] = useState<WizardDirection>('forward');

  const setValue = useCallback(
    <K extends keyof WizardValues>(key: K, value: WizardValues[K]): void => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const canAdvance = useMemo(
    () =>
      validateStep(currentStep, values, audit.minInputLength, audit.maxInputLength),
    [currentStep, values, audit.minInputLength, audit.maxInputLength],
  );

  const isStepOptional = useCallback(
    (step: StepIndex): boolean => step === 1,
    [],
  );

  const goNext = useCallback((): void => {
    setCurrentStep((curr) => {
      if (curr >= 4) return curr;
      const next = (curr + 1) as StepIndex;
      setDirection('forward');
      setVisited((prev) => {
        const updated = new Set(prev);
        updated.add(next);
        return updated;
      });
      return next;
    });
  }, []);

  const goPrev = useCallback((): void => {
    setCurrentStep((curr) => {
      if (curr <= 0) return curr;
      setDirection('backward');
      return (curr - 1) as StepIndex;
    });
  }, []);

  const goTo = useCallback((step: StepIndex): void => {
    setCurrentStep((curr) => {
      if (step === curr) return curr;
      setDirection(step > curr ? 'forward' : 'backward');
      setVisited((prev) => {
        const updated = new Set(prev);
        updated.add(step);
        return updated;
      });
      return step;
    });
  }, []);

  const reset = useCallback((): void => {
    setCurrentStep(0);
    setValues(INITIAL_VALUES);
    setVisited(new Set([0]));
    setDirection('forward');
  }, []);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    values,
    visited,
    direction,
    canAdvance,
    isStepOptional,
    setValue,
    goNext,
    goPrev,
    goTo,
    reset,
  };
}
