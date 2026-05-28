/**
 * Singleton observer del estado del AI Audit.
 *
 * Las islas que reaccionan al audit (ParticleField shader, GradientMeshBackground)
 * se suscriben aquí en vez de instanciar sus propios listeners. La UI del audit
 * (AiAuditTool, AuditResult) despacha estados conforme avanza el pipeline.
 *
 * Estados:
 *   - idle       → ningún audit corriendo (default).
 *   - processing → submit recibido, esperando primera respuesta del backend.
 *   - revealing  → al menos una oportunidad llegó del stream.
 *   - done       → audit completo. Lleva payload.score (madurez 1-10).
 */

export type AuditState = 'idle' | 'processing' | 'revealing' | 'done';

export interface AuditPayload {
  score?: number;
}

type Listener = (state: AuditState, payload: AuditPayload) => void;

const listeners = new Set<Listener>();
let current: AuditState = 'idle';
let payload: AuditPayload = {};

export function setAuditState(state: AuditState, p: AuditPayload = {}): void {
  current = state;
  payload = p;
  listeners.forEach((l) => l(state, p));
}

export function getAuditState(): { state: AuditState; payload: AuditPayload } {
  return { state: current, payload };
}

export function subscribeAuditState(l: Listener): () => void {
  listeners.add(l);
  l(current, payload);
  return () => {
    listeners.delete(l);
  };
}
