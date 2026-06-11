/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ANTHROPIC_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
  RESEND_API_KEY: string;
  DAILY_AUDIT_CAP: string;
  KV: KVNamespace;
  // IPs separadas por coma que se saltan rate limit + daily cap (dev/demos).
  AUDIT_IP_ALLOWLIST?: string;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const;
