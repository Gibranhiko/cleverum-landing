/// <reference types="@cloudflare/workers-types" />
import type { AuditResult } from '../../src/lib/audit/types';
import { site } from '../../src/content/site';

const BRAND_NAME = site.brand.name;
const BRAND_TAGLINE = site.brand.bajada;
const URL = site.meta.url;
const WHATSAPP_URL = `https://wa.me/${site.contact.whatsapp.number}`;
const CALENDLY_URL = site.contact.calendly.includes('REPLACE_ME')
  ? WHATSAPP_URL
  : site.contact.calendly;
const GIBRAN_EMAIL = site.contact.email;
const MANIFESTO = site.footer.manifesto;

const SERVICE_NAME: Record<string, string> = {
  web: 'Sitio web',
  auto: 'Automatización con IA',
  chatbot: 'Chatbot de WhatsApp',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildClientEmailHtml(audit: AuditResult, nombre: string): string {
  const oppRows = audit.oportunidades
    .map(
      (o, i) => `
      <tr><td style="padding:28px 0 4px;border-top:1px solid #1f1f24;">
        <div style="color:#7C5CFF;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">
          ${String(i + 1).padStart(2, '0')} · ${o.categoria === 'quick-win' ? 'Ganancia rápida' : 'Apuesta estratégica'}
        </div>
        <h3 style="margin:0 0 12px;color:#ffffff;font-size:22px;line-height:1.2;font-weight:600;letter-spacing:-0.015em;">
          ${escapeHtml(o.titulo)}
        </h3>
        <p style="margin:0 0 16px;color:#B4B4BF;font-size:15px;line-height:1.55;">
          ${escapeHtml(o.porque)}
        </p>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:14px;color:#B4B4BF;line-height:1.5;">
          <tr><td style="padding:3px 0;"><strong style="color:#ffffff;">Retorno:</strong> ${escapeHtml(o.roi_estimado)}</td></tr>
          <tr><td style="padding:3px 0;"><strong style="color:#ffffff;">Tecnologías:</strong> ${o.stack_recomendado.map(escapeHtml).join(' · ')}</td></tr>
          <tr><td style="padding:3px 0;"><strong style="color:#ffffff;">Tiempo:</strong> ${escapeHtml(o.tiempo_implementacion)} · Complejidad ${escapeHtml(o.complejidad)}</td></tr>
          <tr><td style="padding:3px 0;"><strong style="color:#ffffff;">Proyecto:</strong> ${SERVICE_NAME[o.sprint_recomendado] ?? o.sprint_recomendado}</td></tr>
        </table>
      </td></tr>
    `,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tu audit de IA — ${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#08080B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#08080B" style="background:#08080B;">
  <tr><td align="center" style="padding:40px 20px;">
    <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:0 0 32px;">
        <div style="font-size:26px;font-weight:600;letter-spacing:-0.025em;color:#ffffff;">${BRAND_NAME}</div>
        <div style="font-size:13px;color:#8A8A96;margin-top:2px;letter-spacing:-0.005em;">${BRAND_TAGLINE}</div>
      </td></tr>

      <tr><td style="padding:0 0 28px;">
        <h1 style="margin:0 0 16px;font-size:34px;line-height:1.1;letter-spacing:-0.03em;color:#ffffff;font-weight:600;">
          Hola ${escapeHtml(nombre)}.
        </h1>
        <p style="margin:0 0 14px;color:#B4B4BF;font-size:16px;line-height:1.55;">
          Aquí está el análisis completo que te prometí.
        </p>
        <p style="margin:0;color:#B4B4BF;font-size:16px;line-height:1.55;">
          <strong style="color:#ffffff;">Tu negocio:</strong> ${escapeHtml(audit.negocio_detectado)}<br>
          <strong style="color:#ffffff;">Score de madurez:</strong> ${audit.score_madurez}/10
          <span style="color:#8A8A96;">(industria promedio: ${audit.benchmark.industria_promedio}/10, líder: ${audit.benchmark.lider}/10)</span><br>
          <strong style="color:#ffffff;">Tu potencial:</strong> ${audit.benchmark.tu_potencial}/10 si ejecutas las 3 jugadas de abajo.
        </p>
      </td></tr>

      <tr><td style="padding:32px 0 12px;">
        <div style="font-size:11px;color:#8A8A96;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;">
          Las 3 oportunidades · en orden de impacto
        </div>
      </td></tr>

      ${oppRows}

      <tr><td style="padding:32px 0 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#111114;border:1px solid #2a2440;border-radius:16px;">
          <tr><td style="padding:24px;">
            <div style="font-size:11px;color:#7C5CFF;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;margin-bottom:10px;">
              Mi recomendación
            </div>
            <p style="margin:0;color:#ffffff;font-size:16px;line-height:1.5;">
              ${escapeHtml(audit.recomendacion_prioritaria.razon)}
            </p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:56px 0 24px;">
        <div style="font-size:11px;color:#8A8A96;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;margin-bottom:14px;">
          Tu regalo
        </div>
        <h2 style="margin:0 0 14px;font-size:24px;color:#ffffff;font-weight:600;letter-spacing:-0.02em;line-height:1.15;">
          Sesión 20 min conmigo, gratis.
        </h2>
        <p style="margin:0 0 24px;color:#B4B4BF;font-size:15px;line-height:1.55;">
          Agendamos. Te explico cómo aterrizar la oportunidad #1. Resolvemos dudas. Sin venta forzada.<br>
          <strong style="color:#ffffff;">Bonus extra:</strong> si arrancamos en los próximos 14 días, <strong>10% off</strong> en tu primer sprint.
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:0 12px 12px 0;">
              <a href="${CALENDLY_URL}" style="display:inline-block;padding:14px 28px;background:#22C55E;color:#04130b;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
                Agenda 20 min gratis →
              </a>
            </td>
            <td style="padding:0 0 12px 0;">
              <a href="${WHATSAPP_URL}" style="display:inline-block;padding:14px 28px;background:transparent;color:#ffffff;text-decoration:none;border:1px solid #2a2a30;border-radius:9999px;font-weight:500;font-size:15px;">
                WhatsApp directo
              </a>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:48px 0 0;border-top:1px solid #1f1f24;">
        <p style="margin:0;color:#B4B4BF;font-size:15px;line-height:1.55;">
          — Gibran Villarreal<br>
          <span style="color:#8A8A96;font-size:13px;">${BRAND_NAME} · single war machine</span><br>
          <a href="mailto:${GIBRAN_EMAIL}" style="color:#7C5CFF;text-decoration:none;font-size:13px;">${GIBRAN_EMAIL}</a>
        </p>
      </td></tr>

      <tr><td style="padding:48px 0 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:500;color:#ffffff;font-style:italic;letter-spacing:-0.01em;">
          "${MANIFESTO}"
        </p>
        <p style="margin:0;font-size:11px;color:#8A8A96;letter-spacing:0.04em;">
          ${URL} · Audit ID: ${audit.audit_id}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export interface LeadRecord {
  nombre: string;
  empresa: string;
  email: string | null;
  telefono: string | null;
  audit_id: string;
  created_at: string;
}

export function buildGibranNotificationHtml(
  lead: LeadRecord,
  audit: AuditResult,
): string {
  const oppList = audit.oportunidades
    .map(
      (o, i) =>
        `<li style="margin-bottom:8px;color:#B4B4BF;line-height:1.5;"><strong style="color:#ffffff;">${i + 1}. ${escapeHtml(o.titulo)}</strong> — ${escapeHtml(o.roi_estimado)} <span style="color:#8A8A96;">(${o.sprint_recomendado}, ${o.categoria}, conf. ${o.confianza})</span></li>`,
    )
    .join('');

  const emailRow = lead.email
    ? `<tr><td><strong style="color:#ffffff;">Email:</strong></td><td style="padding-left:12px;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#7C5CFF;text-decoration:none;">${escapeHtml(lead.email)}</a></td></tr>`
    : `<tr><td><strong style="color:#ffffff;">Email:</strong></td><td style="padding-left:12px;color:#8A8A96;">No proporcionado</td></tr>`;

  const phoneRow = lead.telefono
    ? `<tr><td><strong style="color:#ffffff;">Teléfono:</strong></td><td style="padding-left:12px;"><a href="tel:${escapeHtml(lead.telefono)}" style="color:#7C5CFF;text-decoration:none;">${escapeHtml(lead.telefono)}</a></td></tr>`
    : `<tr><td><strong style="color:#ffffff;">Teléfono:</strong></td><td style="padding-left:12px;color:#8A8A96;">No proporcionado</td></tr>`;

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#08080B;color:#ffffff;padding:24px;margin:0;">
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#111114;border-radius:12px;padding:28px;border:1px solid #1f1f24;">
<tr><td>
<h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;letter-spacing:-0.015em;">Nuevo lead audit</h2>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#B4B4BF;line-height:1.7;width:100%;">
<tr><td><strong style="color:#ffffff;">Nombre:</strong></td><td style="padding-left:12px;">${escapeHtml(lead.nombre)}</td></tr>
<tr><td><strong style="color:#ffffff;">Empresa:</strong></td><td style="padding-left:12px;">${escapeHtml(lead.empresa)}</td></tr>
${emailRow}
${phoneRow}
<tr><td><strong style="color:#ffffff;">Audit ID:</strong></td><td style="padding-left:12px;font-family:monospace;font-size:12px;color:#8A8A96;">${lead.audit_id}</td></tr>
<tr><td style="padding-top:12px;"><strong style="color:#ffffff;">Negocio:</strong></td><td style="padding:12px 0 0 12px;">${escapeHtml(audit.negocio_detectado)}</td></tr>
<tr><td><strong style="color:#ffffff;">Industria:</strong></td><td style="padding-left:12px;">${escapeHtml(audit.industria)} · score ${audit.score_madurez}/10</td></tr>
</table>
<h3 style="margin:24px 0 8px;color:#ffffff;font-size:16px;letter-spacing:-0.015em;">Oportunidades</h3>
<ol style="margin:0;padding-left:20px;">
${oppList}
</ol>
<p style="margin:24px 0 0;color:#8A8A96;font-size:12px;line-height:1.5;">
Reply directo a este email rebota al lead${lead.email ? '' : ' (si tiene email)'}. Para arrancar conversación, escríbele directo.
</p>
</td></tr></table>
</body></html>`;
}
