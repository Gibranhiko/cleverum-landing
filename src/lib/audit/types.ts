/**
 * Types compartidos entre el endpoint de audit y la UI.
 * El frontend importa estos types para tipar los eventos SSE.
 */

import type { SprintId, Complexity, Category } from './patterns';

export interface IndustryClassification {
  industria: string;
  sub_vertical: string;
  maturity_score: number;
  signals: string[];
}

export interface IceScore {
  impact: number;
  confidence: number;
  ease: number;
  promedio: number;
}

export interface Opportunity {
  titulo: string;
  porque: string;
  patron_aplicado: string;
  stack_recomendado: string[];
  roi_estimado: string;
  complejidad: Complexity;
  tiempo_implementacion: string;
  sprint_recomendado: SprintId;
  categoria: Category;
  ice_score: IceScore;
  confianza: number;
}

export interface MaturityBenchmark {
  industria_promedio: number;
  lider: number;
  tu_potencial: number;
}

export interface AuditResult {
  audit_id: string;
  negocio_detectado: string;
  industria: string;
  score_madurez: number;
  benchmark: MaturityBenchmark;
  oportunidades: Opportunity[];
  recomendacion_prioritaria: {
    oportunidad_index: number;
    razon: string;
  };
}

export type SseEventName =
  | 'status'
  | 'industry'
  | 'thinking'
  | 'opportunities_draft'
  | 'maturity'
  | 'done'
  | 'email_status'
  | 'error';

export interface SseStatusPayload {
  stage: 'classifying' | 'analyzing' | 'critiquing' | 'saving';
}

export interface SseThinkingPayload {
  delta: string;
}

export interface SseErrorPayload {
  code: string;
  message: string;
}

export interface SseDonePayload {
  audit_id: string;
  audit: AuditResult;
}

export interface AuditExtra {
  industria?: string;
  equipo?: string;
  stack?: string;
  pain?: string;
}

export interface AuditContact {
  nombre: string;
  empresa: string;
  email?: string;
  telefono?: string;
}

export interface AuditRequestBody {
  input: string;
  extra?: AuditExtra;
  contact: AuditContact;
  turnstileToken: string;
}

export interface LeadRequestBody {
  email: string;
  audit_id: string;
}

export interface SseEmailStatusPayload {
  sent: boolean;
  reason?: 'no_email' | 'send_failed';
}
