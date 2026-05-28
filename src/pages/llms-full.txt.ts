import type { APIRoute } from 'astro';
import { site } from '~/content/site';

function isReal(url: string): boolean {
  return !url.includes('REPLACE_ME');
}

export const GET: APIRoute = () => {
  const { contact, brand, services, cases, about, socials, meta, audit, footer } = site;

  const socialLines = [
    { name: 'LinkedIn', url: socials.linkedin },
    { name: 'GitHub', url: socials.github },
    { name: 'X (Twitter)', url: socials.twitter },
  ]
    .filter((s) => isReal(s.url))
    .map((s) => `- **${s.name}:** ${s.url}`);

  const calendlyLine = isReal(contact.calendly)
    ? `- **Calendly:** ${contact.calendly}`
    : '- **Calendly:** Available — schedule via https://cleverum.org/';

  const servicesSection = services.items
    .map((s) => {
      const bullets = s.bullets.map((b) => `- ${b}`).join('\n');
      return `### ${s.title} — ${s.priceFrom}

**Duration:** ${s.duration}

${s.subtitle}:

${bullets}`;
    })
    .join('\n\n');

  const casesSection = cases.items
    .map((c) => {
      return `### ${c.number} — ${c.solution}

**Problem:** ${c.problem}
**Solution:** ${c.solution}
**Impact:** ${c.impact}
**Stack:** ${c.stack.join(', ')}`;
    })
    .join('\n\n');

  const aboutParagraphs = about.paragraphs.map((p) => p).join('\n\n');

  const content = `# ${brand.name}

> ${brand.name} is a one-person studio building AI automation systems for small and medium businesses (SMBs) in Mexico and LATAM. The founder, ${contact.name}, is an indie hacker who handles the full stack: diagnosis, design, and delivery — no agency, no offshore team, no junior devs.

**Tagline:** ${footer.manifesto}

## Founder

- **Name:** ${contact.name}
- **Role:** Founder & Technology Lead
- **Location:** ${brand.location}
- **Email:** ${contact.email}
- **WhatsApp:** ${contact.phoneDisplay}
${calendlyLine}
${socialLines.join('\n')}

## Bio

${aboutParagraphs}

## AI Audit Tool

${audit.headline} A free AI-powered diagnosis available at ${meta.url}/.

${audit.pitch.join('\n\n')}

The audit uses a multi-agent pipeline (industry classifier → senior business analyst with extended thinking → critic) trained on 50+ real workflows built by ${brand.name} across LATAM.

**Input:** Business URL or short description (${audit.minInputLength}-${audit.maxInputLength} characters).

**Output:** Industry classification + maturity score + 3 ranked opportunities (each with ROI estimate, recommended stack, suggested sprint, ICE score).

**Bonus:** If you decide to execute, free 20-minute strategy session + 10% off your first sprint.

## Services

${services.heading} ${services.subheading}

${servicesSection}

## Cases

${cases.heading} ${cases.subheading}

${casesSection}

## Technology Stack

- **Frontend:** Astro 5, React 19, TypeScript, Tailwind v4
- **3D / WebGL:** React Three Fiber, three.js, custom GLSL shaders
- **Animation:** GSAP + ScrollTrigger, CSS scroll-driven (\`animation-timeline: view()\`)
- **AI:** Anthropic Claude (Haiku, Sonnet, Opus), OpenAI GPT, MCP servers
- **Automation:** n8n, Make
- **Mobile:** React Native, Expo
- **Backend / Infra:** Cloudflare Pages + Functions + KV + Workers + Turnstile, Supabase, Resend
- **Tooling:** Vite, Wrangler

## Languages

Spanish (primary — all marketing copy and customer communication). English (secondary, for international queries and technical docs).

## Pages

- [/](${meta.url}/): Home — full landing page with hero, AI audit tool, cases, services, about, contact
- [/llms.txt](${meta.url}/llms.txt): Short LLM-readable summary
- [/llms-full.txt](${meta.url}/llms-full.txt): This file
- [/api/info.json](${meta.url}/api/info.json): Structured JSON for AI agents (coming soon)
- [/api/audit](${meta.url}/api/audit): AI Audit Tool API endpoint (coming soon)
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
