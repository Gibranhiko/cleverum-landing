import { site } from '~/content/site';

/**
 * Construye un link wa.me con mensaje pre-llenado y URL-encoded.
 * Si no se pasa mensaje, usa el default de `site.contact.whatsapp.prefilledMessage`.
 */
export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? site.contact.whatsapp.prefilledMessage);
  return `https://wa.me/${site.contact.whatsapp.number}?text=${text}`;
}
