/// <reference types="@cloudflare/workers-types" />
import { CORS_HEADERS } from '../types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_VERSION = '2023-06-01';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/* ============================================================
 * HTTP helpers
 * ========================================================== */

export function jsonError(status: number, code: string, message?: string): Response {
  return new Response(JSON.stringify({ error: code, message: message ?? code }), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

/* ============================================================
 * URL detection + HTML fetch
 * ========================================================== */

export function isUrl(input: string): boolean {
  const candidate = input.startsWith('http') ? input : `https://${input}`;
  try {
    const u = new URL(candidate);
    return u.hostname.includes('.') && !u.hostname.includes(' ');
  } catch {
    return false;
  }
}

// Defensa SSRF: hosts internos/privados que NUNCA debemos fetchear.
function isBlockedFetchHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h === '::1' ||
    h === '0.0.0.0'
  ) {
    return true;
  }
  // IPv4 loopback / privados / link-local (metadata cloud 169.254.169.254)
  if (
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  ) {
    return true;
  }
  // Debe parecer un dominio público (tener un punto).
  return !h.includes('.');
}

// Tope de lectura: nunca cargamos más de esto en memoria (anti respuesta gigante).
const MAX_FETCH_BYTES = 512 * 1024;

export async function fetchHtml(input: string, maxChars = 3000): Promise<string | null> {
  const raw = input.startsWith('http') ? input : `https://${input}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  // Solo http/https y hosts públicos (anti-SSRF).
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (isBlockedFetchHost(url.hostname)) return null;

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 5000);
    const r = await fetch(url.toString(), {
      signal: ac.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CleverumAuditBot/1.0; +https://cleverum.org)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!r.ok || !r.body) return null;

    // Lectura acotada por bytes (no usamos r.text() porque cargaría todo el body).
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let bytes = 0;
    while (bytes < MAX_FETCH_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      text += decoder.decode(value, { stream: true });
      // Con ~maxChars*8 de HTML crudo basta para limpiar a maxChars.
      if (text.length > maxChars * 8) break;
    }
    try {
      await reader.cancel();
    } catch {
      /* noop */
    }

    const cleaned = text
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.slice(0, maxChars);
  } catch {
    return null;
  }
}

/* ============================================================
 * Turnstile verification
 * ========================================================== */

export async function verifyTurnstile(
  token: string,
  secret: string,
  request: Request,
): Promise<boolean> {
  if (!token || !secret) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  if (ip) form.append('remoteip', ip);
  try {
    const r = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
    if (!r.ok) return false;
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/* ============================================================
 * Rate limiting + daily cap (KV-backed)
 * ========================================================== */

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

export async function checkAndConsumeRateLimit(
  kv: KVNamespace,
  ip: string,
  maxPerDay = 3,
): Promise<RateLimitResult> {
  if (!ip) return { allowed: false, reason: 'no_ip' };
  const key = `rate:${ip}`;
  const existing = await kv.get(key);
  const current = existing ? parseInt(existing, 10) || 0 : 0;
  if (current >= maxPerDay) return { allowed: false, reason: 'rate_limited' };
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 24 });
  return { allowed: true };
}

/**
 * IPs en la allowlist (env AUDIT_IP_ALLOWLIST, separadas por coma) se saltan
 * rate limit + daily cap. Para dev/demos del owner.
 */
export function isIpAllowlisted(ip: string, allowlist?: string): boolean {
  if (!ip || !allowlist) return false;
  return allowlist
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .includes(ip);
}

export interface DailyCapResult {
  allowed: boolean;
  remaining: number;
}

export async function checkAndIncrementDailyCap(
  kv: KVNamespace,
  capStr: string,
): Promise<DailyCapResult> {
  const cap = Math.max(1, parseInt(capStr, 10) || 100);
  const today = new Date().toISOString().slice(0, 10);
  const key = `audit:count:${today}`;
  const currentStr = await kv.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;
  if (current >= cap) return { allowed: false, remaining: 0 };
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 48 });
  return { allowed: true, remaining: cap - current - 1 };
}

/**
 * Cap GLOBAL por hora (además del diario). Suaviza ráfagas y ataques
 * distribuidos (muchas IPs en poco tiempo) que el rate-limit por IP no frena.
 */
export async function checkAndIncrementHourlyCap(
  kv: KVNamespace,
  hourlyCap: number,
): Promise<boolean> {
  const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const key = `audit:count:hour:${hour}`;
  const currentStr = await kv.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;
  if (current >= hourlyCap) return false;
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 2 });
  return true;
}

/* ============================================================
 * Anthropic Messages API — non-streaming
 * ========================================================== */

interface CallAnthropicOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
  thinking?: string;
}

interface AnthropicMessageResponse {
  content?: AnthropicContentBlock[];
  stop_reason?: string;
}

/**
 * Construye el bloque `system` con cache_control para aprovechar prompt caching.
 * Los system prompts (analista con 15 patrones, crítico) son idénticos en cada
 * audit → a partir del 2º request dentro del TTL (~5 min) se sirven de caché:
 * TTFT más rápido y ~10% del costo de input. Mínimo cacheable en Haiku: 4096
 * tokens (prompts más cortos simplemente no cachean, sin error).
 */
function cacheableSystem(text: string) {
  return [{ type: 'text', text, cache_control: { type: 'ephemeral' } }];
}

export async function callAnthropic(apiKey: string, opts: CallAnthropicOptions): Promise<string> {
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens,
      system: cacheableSystem(opts.system),
      messages: [{ role: 'user', content: opts.user }],
      temperature: opts.temperature ?? 0.7,
    }),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`anthropic_error_${r.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await r.json()) as AnthropicMessageResponse;
  const textBlock = data.content?.find((c) => c.type === 'text');
  return textBlock?.text ?? '';
}

/* ============================================================
 * Anthropic Messages API — streaming with extended thinking
 * ========================================================== */

interface CallAnthropicThinkingOptions {
  system: string;
  user: string;
  maxTokens: number;
  thinkingBudget: number;
  onThinking: (delta: string) => void;
}

interface SseDelta {
  type:
    | 'message_start'
    | 'content_block_start'
    | 'content_block_delta'
    | 'content_block_stop'
    | 'message_delta'
    | 'message_stop'
    | 'ping'
    | string;
  delta?: {
    type?: 'text_delta' | 'thinking_delta' | string;
    text?: string;
    thinking?: string;
  };
  content_block?: {
    type?: string;
  };
  index?: number;
}

export async function callAnthropicWithThinking(
  apiKey: string,
  opts: CallAnthropicThinkingOptions,
): Promise<string> {
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens,
      system: cacheableSystem(opts.system),
      messages: [{ role: 'user', content: opts.user }],
      stream: true,
      thinking: {
        type: 'enabled',
        budget_tokens: opts.thinkingBudget,
      },
    }),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`anthropic_stream_error_${r.status}: ${errText.slice(0, 300)}`);
  }
  if (!r.body) throw new Error('anthropic_no_body');

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalText = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const ev = JSON.parse(payload) as SseDelta;
        if (ev.type === 'content_block_delta' && ev.delta) {
          if (ev.delta.type === 'thinking_delta' && ev.delta.thinking) {
            opts.onThinking(ev.delta.thinking);
          } else if (ev.delta.type === 'text_delta' && ev.delta.text) {
            finalText += ev.delta.text;
          }
        }
      } catch {
        // ignore malformed events
      }
    }
  }

  return finalText;
}

/* ============================================================
 * JSON extraction from LLM responses
 * ========================================================== */

export function parseJsonFromLlm<T>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown fences if present
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence && fence[1]) {
    cleaned = fence[1].trim();
  }
  // If there's surrounding prose, isolate the JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned) as T;
}

/* ============================================================
 * SSE event encoder
 * ========================================================== */

const encoder = new TextEncoder();

export function sseEvent(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
