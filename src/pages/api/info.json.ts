import type { APIRoute } from 'astro';
import { site } from '~/content/site';

function isReal(url: string): boolean {
  return !url.includes('REPLACE_ME');
}

export const GET: APIRoute = () => {
  const { meta, brand, contact, services, cases, socials, footer, audit } = site;

  const data = {
    name: brand.name,
    tagline: footer.manifesto,
    url: meta.url,
    description: meta.description,
    location: brand.location,
    languages: ['es', 'en'],

    founder: {
      name: contact.name,
      role: 'Founder & independent developer',
      email: contact.email,
      phone_display: contact.phoneDisplay,
      phone_tel: contact.phoneTel,
    },

    services: services.items.map((s) => ({
      id: s.id,
      name: s.title,
      subtitle: s.subtitle,
      duration: s.duration,
      bullets: s.bullets,
      ideal_for: s.idealFor,
      investment_tier: s.inversion,
      pricing: 'Cotización personalizada según alcance',
      whatsapp_message: `¡Hola Gibran! Me interesa el servicio de ${s.title}.`,
    })),

    cases: cases.items.map((c) => ({
      id: c.id,
      number: c.number,
      problem: c.problem,
      solution: c.solution,
      impact: c.impact,
      stack: c.stack,
    })),

    contact: {
      whatsapp_url: `https://wa.me/${contact.whatsapp.number}`,
      whatsapp_display: contact.phoneDisplay,
      email: contact.email,
      calendly: isReal(contact.calendly) ? contact.calendly : null,
    },

    socials: {
      linkedin: isReal(socials.linkedin) ? socials.linkedin : null,
      twitter: isReal(socials.twitter) ? socials.twitter : null,
      github: isReal(socials.github) ? socials.github : null,
    },

    ai_audit: {
      endpoint: `${meta.url}/api/audit`,
      description: audit.heading,
      intro: audit.intro,
      input: {
        min_length: audit.minInputLength,
        max_length: audit.maxInputLength,
      },
    },

    llm_resources: {
      llms_txt: `${meta.url}/llms.txt`,
      llms_full_txt: `${meta.url}/llms-full.txt`,
    },

    updated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
