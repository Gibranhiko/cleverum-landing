import type { APIRoute } from 'astro';
import { site } from '~/content/site';

function isReal(url: string): boolean {
  return !url.includes('REPLACE_ME');
}

export const GET: APIRoute = () => {
  const { contact, brand, services, socials, meta, audit } = site;

  const socialLines = [
    { name: 'LinkedIn', url: socials.linkedin },
    { name: 'GitHub', url: socials.github },
    { name: 'X (Twitter)', url: socials.twitter },
  ]
    .filter((s) => isReal(s.url))
    .map((s) => `- ${s.name}: ${s.url}`);

  const calendlyLine = isReal(contact.calendly)
    ? `- Calendly: ${contact.calendly}`
    : null;

  const serviceLines = services.items.map(
    (s) => `- ${s.title} — ${s.subtitle.toLowerCase()}, ${s.duration}`,
  );

  const content = `# Cleverum

> Cleverum is a team building AI automation systems for SMBs in Mexico and LATAM. Full stack, zero excuses.

Location: ${brand.location}
Languages: Spanish (primary), English

## Services

${serviceLines.join('\n')}

## AI Audit Tool

${audit.heading} Available at ${meta.url}/#diagnostico. Submit your URL or business description and receive:

- Industry classification with a maturity score
- 1 high-impact automation opportunity
- ROI estimates per opportunity
- Recommended technology stack
- Optional 20-minute free strategy session

## Stack

Astro, React, TypeScript, Tailwind, n8n, Anthropic Claude, OpenAI,
Cloudflare (Pages + Functions + KV), Supabase, React Native.

## Contact

- WhatsApp: ${contact.phoneDisplay}
- Email: ${contact.email}
${calendlyLine ? calendlyLine + '\n' : ''}${socialLines.join('\n')}

## Pages

- [/](${meta.url}/): Home — hero, AI audit tool, cases, services, about Cleverum, contact
- [/llms-full.txt](${meta.url}/llms-full.txt): Extended markdown version of this file
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
