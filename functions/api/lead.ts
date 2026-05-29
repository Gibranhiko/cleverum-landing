/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../types';
import type { AuditResult, LeadRequestBody } from '../../src/lib/audit/types';
import { jsonError, jsonOk } from './_audit-utils';
import {
  isValidEmail,
  isDisposableEmail,
  sendClientReport,
} from './_lead-handler';
import type { LeadRecord } from './_email-template';

/**
 * Endpoint para el mini-ask post-audit: el user no dejó email en el form
 * inicial y quiere recibir el reporte detallado por correo.
 *
 * Recibe: { email, audit_id }
 * El lead ya existe en KV (creado por /api/audit). Actualizamos su email
 * y mandamos el reporte. No re-notificamos a Gibran (ya recibió el lead
 * cuando se completó el audit).
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: LeadRequestBody;
  try {
    body = (await request.json()) as LeadRequestBody;
  } catch {
    return jsonError(400, 'invalid_body', 'Body inválido (JSON requerido).');
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const auditId = String(body.audit_id ?? '').trim();

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
  if (!auditId) return jsonError(400, 'audit_id_required');

  const auditRaw = await env.KV.get(`audit:${auditId}`);
  if (!auditRaw) {
    return jsonError(
      404,
      'audit_not_found',
      'El diagnóstico expiró o no existe. Corre uno nuevo desde la landing.',
    );
  }

  let audit: AuditResult;
  try {
    audit = JSON.parse(auditRaw) as AuditResult;
  } catch {
    return jsonError(500, 'audit_corrupted');
  }

  // Load existing lead (created during /api/audit submit)
  const leadRaw = await env.KV.get(`lead:${auditId}`);
  if (!leadRaw) {
    return jsonError(404, 'lead_not_found', 'No encuentro tu lead asociado.');
  }

  let lead: LeadRecord;
  try {
    lead = JSON.parse(leadRaw) as LeadRecord;
  } catch {
    return jsonError(500, 'lead_corrupted');
  }

  // Update lead with email and re-persist
  const updatedLead: LeadRecord = { ...lead, email };
  await env.KV.put(`lead:${auditId}`, JSON.stringify(updatedLead), {
    expirationTtl: 60 * 60 * 24 * 365,
  });

  // Send the report
  const sent = await sendClientReport(env.RESEND_API_KEY, audit, {
    nombre: updatedLead.nombre,
    empresa: updatedLead.empresa,
    email,
    ...(updatedLead.telefono && { telefono: updatedLead.telefono }),
  });

  return jsonOk({
    status: sent ? 'sent' : 'queued',
    client_email_sent: sent,
  });
};
