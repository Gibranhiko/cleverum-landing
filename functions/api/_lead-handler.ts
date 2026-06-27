/// <reference types="@cloudflare/workers-types" />
import type { AuditContact, AuditResult } from '../../src/lib/audit/types';
import { site } from '../../src/content/site';
import {
  buildClientEmailHtml,
  buildGibranNotificationHtml,
  type LeadRecord,
} from './_email-template';

const RESEND_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = `Cleverum <hello@cleverum.org>`;
const NOTIFY_FROM = `Cleverum Bot <hello@cleverum.org>`;
const GIBRAN_EMAIL = site.contact.email;
const LEAD_TTL_SECONDS = 60 * 60 * 24 * 365;

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'temp-mail.org',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  '10minutemail.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'getairmail.com',
  'sharklasers.com',
  'dispostable.com',
]);

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at === -1) return false;
  return DISPOSABLE_DOMAINS.has(email.slice(at + 1).toLowerCase());
}

interface ResendPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}

async function sendEmail(apiKey: string, payload: ResendPayload): Promise<void> {
  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`resend_${r.status}: ${errText.slice(0, 200)}`);
  }
}

/* ============================================================
 * Persist lead in KV.
 * ========================================================== */

export async function persistLead(
  kv: KVNamespace,
  audit: AuditResult,
  contact: AuditContact,
): Promise<LeadRecord> {
  const lead: LeadRecord = {
    nombre: contact.nombre,
    empresa: contact.empresa,
    email: contact.email ?? null,
    telefono: contact.telefono ?? null,
    audit_id: audit.audit_id,
    created_at: new Date().toISOString(),
  };
  await kv.put(`lead:${audit.audit_id}`, JSON.stringify(lead), {
    expirationTtl: LEAD_TTL_SECONDS,
  });
  return lead;
}

/* ============================================================
 * Send the client report email (only if email present).
 * ========================================================== */

export async function sendClientReport(
  apiKey: string,
  audit: AuditResult,
  contact: AuditContact,
): Promise<boolean> {
  if (!contact.email) return false;
  try {
    await sendEmail(apiKey, {
      from: FROM_ADDRESS,
      to: contact.email,
      subject: `Tu diagnóstico de IA — ${audit.oportunidades.length === 1 ? '1 idea' : `${audit.oportunidades.length} ideas`} para automatizar tu negocio`,
      html: buildClientEmailHtml(audit, contact.nombre),
      reply_to: GIBRAN_EMAIL,
    });
    return true;
  } catch {
    return false;
  }
}

/* ============================================================
 * Notify Gibran of a new lead.
 * ========================================================== */

export async function notifyGibran(
  apiKey: string,
  lead: LeadRecord,
  audit: AuditResult,
): Promise<boolean> {
  try {
    await sendEmail(apiKey, {
      from: NOTIFY_FROM,
      to: GIBRAN_EMAIL,
      subject: `Nuevo lead: ${lead.nombre} · ${lead.empresa}`,
      html: buildGibranNotificationHtml(lead, audit),
      ...(lead.email && { reply_to: lead.email }),
    });
    return true;
  } catch {
    return false;
  }
}
