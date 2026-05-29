import type {
  AuditContact,
  AuditExtra,
  AuditResult,
  IndustryClassification,
  SseDonePayload,
  SseEmailStatusPayload,
  SseErrorPayload,
  SseStatusPayload,
  SseThinkingPayload,
} from '~/lib/audit/types';

interface AnalystDraft {
  negocio_detectado: string;
  oportunidades: AuditResult['oportunidades'];
  recomendacion_prioritaria: { oportunidad_index: number; razon: string };
}

export interface SseHandlers {
  onStatus?: (data: SseStatusPayload) => void;
  onIndustry?: (data: IndustryClassification) => void;
  onThinking?: (data: SseThinkingPayload) => void;
  onOpportunitiesDraft?: (data: AnalystDraft) => void;
  onDone?: (data: SseDonePayload) => void;
  onEmailStatus?: (data: SseEmailStatusPayload) => void;
  onError?: (data: SseErrorPayload) => void;
}

export interface AuditRequest {
  input: string;
  extra?: AuditExtra;
  contact: AuditContact;
  turnstileToken: string;
  signal?: AbortSignal;
}

export class AuditHttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuditHttpError';
  }
}

export async function streamAudit(
  req: AuditRequest,
  handlers: SseHandlers,
): Promise<void> {
  const r = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: req.input,
      extra: req.extra,
      contact: req.contact,
      turnstileToken: req.turnstileToken,
    }),
    signal: req.signal,
  });

  if (!r.ok) {
    let code = 'http_error';
    let message = `HTTP ${r.status}`;
    try {
      const errBody = (await r.json()) as { error?: string; message?: string };
      code = errBody.error ?? code;
      message = errBody.message ?? message;
    } catch {
      // ignore
    }
    throw new AuditHttpError(r.status, code, message);
  }

  if (!r.body) {
    throw new AuditHttpError(500, 'no_body', 'Respuesta sin cuerpo.');
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events end with \n\n
    let sepIdx;
    while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);
      parseSseBlock(block, handlers);
    }
  }

  if (buffer.trim()) {
    parseSseBlock(buffer, handlers);
  }
}

function parseSseBlock(block: string, handlers: SseHandlers): void {
  let eventName = '';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (!eventName || dataLines.length === 0) return;

  let data: unknown;
  try {
    data = JSON.parse(dataLines.join('\n'));
  } catch {
    return;
  }

  switch (eventName) {
    case 'status':
      handlers.onStatus?.(data as SseStatusPayload);
      break;
    case 'industry':
      handlers.onIndustry?.(data as IndustryClassification);
      break;
    case 'thinking':
      handlers.onThinking?.(data as SseThinkingPayload);
      break;
    case 'opportunities_draft':
      handlers.onOpportunitiesDraft?.(data as AnalystDraft);
      break;
    case 'done':
      handlers.onDone?.(data as SseDonePayload);
      break;
    case 'email_status':
      handlers.onEmailStatus?.(data as SseEmailStatusPayload);
      break;
    case 'error':
      handlers.onError?.(data as SseErrorPayload);
      break;
  }
}
