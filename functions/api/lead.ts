/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../types';
import { jsonError, jsonOk } from './_audit-utils';
import type { AuditResult, LeadRequestBody } from '../../src/lib/audit/types';
import {
  buildClientEmailHtml,
  buildGibranNotificationHtml,
  type LeadRecord,
} from './_email-template';
import { site } from '../../src/content/site';

const FROM_ADDRESS = `Gibran de Cleverum <hello@cleverum.org>`;
const NOTIFY_FROM = `Cleverum Bot <hello@cleverum.org>`;
const GIBRAN_EMAIL = site.contact.email;
const RESEND_URL = 'https://api.resend.com/emails';
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isDisposableEmail(email: string): boolean {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: LeadRequestBody;
  try {
    body = (await request.json()) as LeadRequestBody;
  } catch {
    return jsonError(400, 'invalid_body', 'Body inválido (JSON requerido).');
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const nombre = String(body.nombre ?? '').trim();
  const auditId = String(body.audit_id ?? '').trim();
  const como = body.comoMeEncontraste ? String(body.comoMeEncontraste).trim() : '';

  // --- Validation ----------------------------------------------------------
  if (!email || !isValidEmail(email)) {
    return jsonError(400, 'email_invalid', 'Email no parece válido.');
  }
  if (isDisposableEmail(email)) {
    return jsonError(
      400,
      'email_disposable',
      'Usa un email real para enviarte el reporte detallado.',
    );
  }
  if (!nombre || nombre.length < 2) {
    return jsonError(400, 'name_required', 'Necesito tu nombre.');
  }
  if (nombre.length > 100) return jsonError(400, 'name_too_long');
  if (!auditId) return jsonError(400, 'audit_id_required');
  if (como.length > 200) return jsonError(400, 'como_too_long');

  // --- Load audit ----------------------------------------------------------
  const auditRaw = await env.KV.get(`audit:${auditId}`);
  if (!auditRaw) {
    return jsonError(
      404,
      'audit_not_found',
      'El audit expiró o no existe. Corre uno nuevo desde la landing.',
    );
  }

  let audit: AuditResult;
  try {
    audit = JSON.parse(auditRaw) as AuditResult;
  } catch {
    return jsonError(500, 'audit_corrupted');
  }

  // --- Save lead -----------------------------------------------------------
  const lead: LeadRecord = {
    email,
    nombre,
    audit_id: auditId,
    como_me_encontraste: como || null,
    created_at: new Date().toISOString(),
  };
  await env.KV.put(`lead:${auditId}`, JSON.stringify(lead), {
    expirationTtl: LEAD_TTL_SECONDS,
  });

  // --- Send emails (best-effort: lead is saved even if email fails) -------
  let clientEmailSent = false;
  let gibranNotified = false;

  try {
    await sendEmail(env.RESEND_API_KEY, {
      from: FROM_ADDRESS,
      to: email,
      subject: 'Tu audit de IA — 3 ideas para automatizar tu negocio',
      html: buildClientEmailHtml(audit, nombre),
      reply_to: GIBRAN_EMAIL,
    });
    clientEmailSent = true;
  } catch {
    // swallow — lead is already saved; Gibran can recover manually
  }

  try {
    await sendEmail(env.RESEND_API_KEY, {
      from: NOTIFY_FROM,
      to: GIBRAN_EMAIL,
      subject: `Nuevo lead: ${nombre} (${email})`,
      html: buildGibranNotificationHtml(lead, audit),
      reply_to: email,
    });
    gibranNotified = true;
  } catch {
    // swallow
  }

  return jsonOk({
    status: 'sent',
    client_email_sent: clientEmailSent,
    gibran_notified: gibranNotified,
  });
};
