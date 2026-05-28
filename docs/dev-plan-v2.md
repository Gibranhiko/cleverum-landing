# Dev Plan v2 — Cleverum × Gibran

> **Re-posicionamiento brutal.** Mata el framing de 3 marcas. Cleverum es UNA marca personal de un single-war-machine. La pieza central es el **AI Audit Tool** multi-agent. El sitio se vuelve AI-readable. Pricing público. Filoso.
>
> Lee primero: [../CLAUDE.md](../CLAUDE.md) (algunas reglas siguen vigentes — stack, tokens, islas).
> Este plan reemplaza la fase 4 de [dev-plan.md](dev-plan.md). Tickets numerados como `V2-T#`.

## Estado actual

- ✅ Bootstrap Astro + tokens + Tailwind v4 + R3F + ParticleField
- ✅ ScrollProgress singleton + Navbar + Hero (con rotating titles a reescribir)
- ✅ HowWeWork, BrandsStack, BentoDifferentiators, CapabilitiesMarquee, ContactCTA, Footer
- ✅ Cloudflare Pages config (_headers, _redirects)
- ✅ JSON-LD básico, OG image, favicons, robots, sitemap
- ✅ Logos optimizados, fonts self-hosted, fluid scale

## Cambios estructurales en este plan

| Tema | Antes | Ahora |
|---|---|---|
| Marca | Devindry + Cleverum + Wabbi | **Cleverum** (única, by Gibran) |
| Posicionamiento | Portafolio multi-marca | Indie hacker · sistemas de IA · MX/LATAM |
| Pieza diferencial | Videos placeholders | **AI Audit Tool multi-agent** con extended thinking |
| Pricing | Oculto | Público (3 sprints con "desde") |
| CTAs | Solo WhatsApp ×5 | WhatsApp (alta) + Calendly (media) + AI Audit (baja) |
| Manifiesto | (eliminado) | **"Un solo dev. Todo el stack. Cero excusas."** |
| SEO | Estándar | **AI-readable** (`/llms.txt` + JSON-LD enriquecido + `/api/info.json`) |

## Nueva estructura del sitio

```
1. NAVBAR              — Cleverum · by Gibran · [Casos · Servicios · Contacto]
2. HERO + AI AUDIT     — Rotating pain titles + input + tip section + dual CTA
3. AUDIT RESULT        — Aparece tras submit: extended thinking + 3 oportunidades + score
4. CASOS REALES        — 3 cards problem-first con placeholders proporcionales (swap a real)
5. SERVICIOS           — 3 sprints productizados con precio público
6. SOBRE GIBRAN        — Foto + bio filosa + socials
7. CTA FINAL           — Calendly + WhatsApp
8. FOOTER              — frase-manifiesto + socials
```

## Arquitectura del AI Audit Tool

```
[Browser]
   │ POST /api/audit { input, extra, turnstileToken }
   ▼
[Cloudflare Pages Function /api/audit]
   │
   ├─ Verifica Turnstile (anti-bot)
   ├─ Rate limit en KV (1/IP/24h, cap diario 100)
   ├─ Si input es URL → fetch HTML (max 3000 chars)
   │
   ├─ [AGENTE 1] Industry Classifier (Haiku, ~1s)
   │     → { industria, sub_vertical, maturity_score }
   │
   ├─ [AGENTE 2] Senior Business Analyst (Haiku + extended thinking, ~3-4s)
   │     System prompt: librería de 15 patrones + frameworks (JTBD, ICE,
   │       Quick Win vs Big Bet) + contexto industria
   │     Stream thinking + 3 oportunidades JSON
   │
   ├─ [AGENTE 3] Critic & Polisher (Haiku, ~1-2s)
   │     Cada oportunidad debe tener score ≥ 7 en todos los criterios
   │     Regenera lo que falle
   │
   └─ Stream SSE al cliente con:
        { type: 'industry', ... }
        { type: 'thinking', delta: '...' }
        { type: 'opportunity', data: {...} }
        { type: 'maturity', ... }
        { type: 'done', audit_id }

[Browser] renderiza progresivamente con typewriter + reveal
[Browser] muestra email gate → POST /api/lead → Resend + KV store
```

**Costo:** ~1.3¢ por audit. Cap diario configurable.

---

## Índice de tickets

### Fase 1 — Limpieza brutal (1 día)
- [V2-T1 — Eliminar secciones obsoletas + componentes huérfanos](#v2-t1)
- [V2-T2 — Actualizar `site.ts` con nuevo posicionamiento + copy + socials placeholder](#v2-t2)
- [V2-T3 — Hero rewrite (copy nuevo, hooks para AI Audit)](#v2-t3)
- [V2-T4 — Navbar update + Footer manifesto](#v2-t4)

### Fase 2 — Contenido real (1-2 días)
- [V2-T5 — Sección `Cases.astro` (3 cards problem-first)](#v2-t5)
- [V2-T6 — Sección `Services.astro` (3 sprints con pricing público)](#v2-t6)
- [V2-T7 — Sección `AboutGibran.astro` (foto + bio filosa + socials)](#v2-t7)
- [V2-T8 — `ContactCTA.astro` actualizado (Calendly + WhatsApp)](#v2-t8)

### Fase 3 — AI-readable site (1 día)
- [V2-T9 — `/llms.txt` y `/llms-full.txt`](#v2-t9)
- [V2-T10 — JSON-LD expandido (Service ×3 con Offer/Price, FAQPage)](#v2-t10)
- [V2-T11 — `robots.txt` enriquecido (allow AI bots)](#v2-t11)
- [V2-T12 — Endpoint `/api/info.json` (structured site info)](#v2-t12)

### Fase 4 — AI Audit Tool multi-agent (4-5 días)
- [V2-T13 — Setup Cloudflare Pages Functions + Turnstile + KV bindings](#v2-t13)
- [V2-T14 — `src/lib/audit/patterns.ts` (los 15 patrones — librería interna)](#v2-t14)
- [V2-T15 — `src/lib/audit/prompts.ts` (los 3 system prompts)](#v2-t15)
- [V2-T16 — Endpoint `functions/api/audit.ts` (pipeline multi-agente + streaming SSE)](#v2-t16)
- [V2-T17 — Endpoint `functions/api/lead.ts` (validación + Resend + KV store)](#v2-t17)
- [V2-T18 — `AiAuditTool.tsx` (UI del input + tip section + ejemplos clickables)](#v2-t18)
- [V2-T19 — `AuditResult.tsx` (renderer del resultado streamed)](#v2-t19)
- [V2-T19.5 — Particle field evolution (audit-reactive + maturity score reveal)](#v2-t195)
- [V2-T20 — Email template del reporte detallado (HTML inline)](#v2-t20)

### Fase 5 — Polish + deploy (1 día)
- [V2-T21 — Responsive review + animaciones polish](#v2-t21)
- [V2-T22 — Lighthouse pass + sitemap update](#v2-t22)
- [V2-T23 — Deploy a Cloudflare Pages + dominio cleverum.org + env vars](#v2-t23)

---

# Fase 1 — Limpieza brutal

## V2-T1
### Eliminar secciones obsoletas + componentes huérfanos

**Objetivo:** Borrar todo el código que ya no se usa para que el repo quede limpio antes de construir lo nuevo.

**Dependencias:** ninguna.

**Archivos a borrar:**
- `src/components/sections/BrandsStack.astro`
- `src/components/sections/BentoDifferentiators.astro`
- `src/components/sections/CapabilitiesMarquee.astro`
- `src/components/sections/HowWeWork.astro`
- `src/components/ui/Eyebrow.astro`
- `src/components/ui/YouTubeLite.astro`
- `src/components/ui/BrandCard.astro`
- `public/logos/devindry-logo.png` (mantener cleverum-logo.png)
- `public/logos/wabbi-logo.png`

**Archivos a modificar:**
- `src/pages/index.astro` — remover imports + uso de las secciones eliminadas
- `package.json` — desinstalar `@astro-community/astro-embed-youtube`

**Pasos:**
1. Eliminar los archivos listados con `rm`.
2. Editar `src/pages/index.astro` y dejar solo `Hero` (las nuevas secciones se agregan en tickets siguientes).
3. `npm uninstall @astro-community/astro-embed-youtube`.

**AC:**
- [ ] `npm run check` pasa con 0 errores.
- [ ] `npm run build` pasa sin warnings de imports muertos.
- [ ] El sitio aún levanta (solo Hero visible).

---

## V2-T2
### Actualizar `site.ts` con nuevo posicionamiento + copy + socials placeholder

**Objetivo:** Re-escribir toda la data del sitio para reflejar la nueva marca única + copy filoso.

**Dependencias:** V2-T1.

**Archivos a modificar:**
- `src/content/site.ts`

**Pasos:** crear estructura nueva (mantén `meta`, `contact`, `hero.rotatingTitles` con copy revisado; agrega `services`, `cases`, `about`, `footer.manifesto`, `socials`):

```ts
export const site = {
  meta: {
    title: 'Cleverum — Sistemas de IA y automatización para PYMES',
    description:
      'Construyo sistemas que ponen tu negocio en piloto automático. Sin agencias, sin BS. Un solo dev, todo el stack.',
    url: 'https://cleverum.org',
    locale: 'es_MX',
    author: 'Gibran Villarreal',
  },

  brand: {
    name: 'Cleverum',
    bajada: 'by Gibran Villarreal',
    location: 'México · LATAM',
  },

  contact: {
    name: 'Gibran Villarreal',
    email: 'gibran.villarreal@cleverum.com',
    phoneDisplay: '+52 55 4143 3545',
    phoneTel: '+525541433545',
    whatsapp: {
      number: '5215541433545',
      prefilledMessage:
        '¡Hola Gibran! Vi tu sitio y quiero hablar sobre un proyecto.',
    },
    calendly: 'https://calendly.com/REPLACE_ME', // PLACEHOLDER
  },

  socials: {
    linkedin: 'https://linkedin.com/in/REPLACE_ME', // PLACEHOLDER
    twitter: 'https://x.com/REPLACE_ME',           // PLACEHOLDER
    github: 'https://github.com/REPLACE_ME',       // PLACEHOLDER
    email: 'gibran.villarreal@cleverum.com',
  },

  hero: {
    rotatingTitles: [
      'Automatiza tus conversaciones y deja de perder ventas en *WhatsApp*.',
      'Lanza la *app móvil* que tu negocio necesita en semanas, no años.',
      'Conecta tus sistemas y olvídate de *copiar datos* a mano.',
      'Pregunta a tu *IA* y obtén el reporte que antes tardaba días.',
      'Atiende a tus clientes *24/7* sin contratar otro agente.',
    ],
    ctaPrimary: 'Hablemos por WhatsApp',
    ctaSecondary: 'Agenda 20 min gratis',
  },

  audit: {
    eyebrow: 'AUDIT GRATIS CON IA · 30 SEGUNDOS',
    headline: 'Diagnóstico inteligente de tu negocio.',
    pitch: [
      'Crucé 50+ workflows que he construido, casos reales en LATAM y lo más nuevo en agentes de IA (Claude · GPT · n8n · MCP).',
      'Te devuelvo 3 oportunidades específicas, ROI estimado y stack recomendado. Si decides ejecutar, sesión 20 min conmigo gratis + 10% off tu primer sprint.',
    ],
    inputPlaceholder: 'Tu URL o tu negocio en 1 línea',
    submitLabel: 'Analizar',
    // Límites de input (validar en frontend Y backend)
    maxInputLength: 500, // caracteres
    minInputLength: 10,  // evita "hola" o submissions vacíos
    tip: {
      title: 'Cómo darle mejor contexto al auditor',
      hints: [
        'Pega tu URL si la tienes — analizo tu sitio en tiempo real',
        'Menciona industria + tamaño aproximado de equipo',
        'Cuéntame lo que más te quita tiempo hoy',
        'Si usas Shopify / HubSpot / Make / n8n, dímelo',
        'Sé conciso: máximo 500 caracteres. El análisis es mejor cuando es directo.',
      ],
      examples: [
        'Ecommerce de ropa MX, atiendo 200 chats/día a mano',
        'SaaS B2B, onboarding manual de 3 horas por cliente',
        'Restaurante con WhatsApp manual + 4 plataformas de delivery',
        'Despacho legal, copia datos entre 5 sistemas cada semana',
      ],
    },
  },

  cases: {
    heading: 'Cosas que he construido.',
    subheading: 'Capturas reales — no mockups, no stock.',
    items: [
      {
        id: 'whatsapp-panel',
        number: '01',
        problem: 'Cliente atendía 200 chats/día a mano.',
        solution: 'Panel admin para chatbots WhatsApp con IA.',
        impact: 'Automatiza el 70% del soporte.',
        stack: ['React', 'n8n', 'Claude', 'Supabase', 'WhatsApp Business API'],
        mediaSrc: null as string | null, // GIF o screenshot 1280×720
        link: null as string | null,
      },
      {
        id: 'web',
        number: '02',
        problem: 'PYME sin presencia digital ni conversión.',
        solution: 'Sitio web optimizado para conversión.',
        impact: 'Lanzamiento + tracking en 3 semanas.',
        stack: ['Next.js', 'Tailwind', 'Vercel', 'Analytics'],
        mediaSrc: null as string | null,
        link: null as string | null,
      },
      {
        id: 'mobile',
        number: '03',
        problem: 'Cliente sin presencia en stores móviles.',
        solution: 'App nativa iOS + Android.',
        impact: 'Live en App Store y Google Play.',
        stack: ['React Native', 'Expo', 'Supabase'],
        mediaSrc: null as string | null,
        link: null as string | null,
      },
    ],
  },

  services: {
    heading: 'Tres formas de trabajar conmigo.',
    subheading: 'Sprints productizados. Scope fijo. Sin sorpresas.',
    items: [
      {
        id: 'web',
        title: 'Sprint Web',
        subtitle: 'Landing o web app',
        bullets: [
          'Hasta N pantallas o secciones',
          'Diseño + desarrollo + deploy',
          'Performance & SEO incluidos',
        ],
        duration: '2-4 semanas',
        priceFrom: '$25,000 MXN',
        accent: 'blue',
      },
      {
        id: 'auto',
        title: 'Sprint Automatización IA',
        subtitle: 'Workflow + agente IA',
        bullets: [
          'Diagnóstico + diseño del flujo',
          'Implementación en n8n / Make',
          'Integraciones a tus herramientas + 1 agente IA',
        ],
        duration: '2-3 semanas',
        priceFrom: '$35,000 MXN',
        accent: 'iris',
      },
      {
        id: 'chatbot',
        title: 'Sprint Chatbot WhatsApp',
        subtitle: 'Bot + panel admin',
        bullets: [
          'Chatbot con IA conversacional',
          'Panel admin para tu equipo',
          'Integraciones a CRM / ERP / e-commerce',
        ],
        duration: '3-5 semanas',
        priceFrom: '$45,000 MXN',
        accent: 'green',
      },
    ],
  },

  about: {
    heading: 'Soy Gibran. Single war machine.',
    photoSrc: '/photos/gibran-placeholder.png',
    paragraphs: [
      'Construyo sistemas de IA y automatización para PYMES en México y LATAM. Solo.',
      'Sin agencia. Sin equipo offshore. Sin junior devs. Sin reuniones de descubrimiento de 8 horas.',
      'Yo te diagnostico. Yo te construyo. Yo te entrego.',
      'Si tu equipo está copiando datos a mano en 2026, estás quemando dinero.',
    ],
  },

  finalCta: {
    heading: '¿Listo para automatizar tu negocio?',
    sub: 'Empieza con un audit gratis de IA o agenda 20 min conmigo.',
  },

  footer: {
    manifesto: 'Un solo dev. Todo el stack. Cero excusas.',
    note: 'Hecho en México · 2026',
  },
} as const;

export type Site = typeof site;
export type Service = (typeof site.services.items)[number];
export type Case = (typeof site.cases.items)[number];
```

**AC:**
- [ ] `npm run check` pasa sin errores.
- [ ] `whatsapp.ts` sigue funcionando con la nueva estructura.
- [ ] Cualquier componente que importaba `site.brands` ya no rompe (ya fueron eliminados en V2-T1).

**Notas:**
- Pricing es **anchor conservador** — fácil ajustar luego.
- Los `REPLACE_ME` se quedan como placeholders hasta que pase URLs reales.
- `manifesto` va al footer como frase final.

---

## V2-T3
### Hero rewrite (copy nuevo, hooks para AI Audit)

**Objetivo:** Reescribir `Hero.astro` para integrar el AI Audit Tool y mantener los rotating titles. Quitar el chevron (ya no apunta a manifesto). Agregar dos CTAs (WhatsApp + Calendly) además del input del audit.

**Dependencias:** V2-T2.

**Archivos a modificar:**
- `src/components/sections/Hero.astro`

**Estructura visual:**

```
[Navbar]
                                                                      
       [Eyebrow opcional con dot pulsante]
                                                                      
       SOLUCIONES INTELIGENTES                  ← rotating titles
       PARA NEGOCIOS QUE                          (cambiar por copy de site.audit)
       EVOLUCIONAN.                                                    
                                                                      
       ┌────────────────────────────────────────────────────────┐    
       │  ✦ AUDIT GRATIS CON IA · 30 SEGUNDOS                   │    
       │                                                          │    
       │  Crucé 50+ workflows…  ▸  3 oportunidades + ROI         │    
       │                                                          │    
       │  ┌──────────────────────────────────┬──────────────┐   │    
       │  │ Tu URL o tu negocio en 1 línea   │  Analizar →  │   │    
       │  └──────────────────────────────────┴──────────────┘   │    
       │                                                          │    
       │  💡 Cómo darle mejor contexto                            │    
       │     • Pega tu URL si la tienes…                          │    
       │     • Menciona industria + equipo…                        │    
       │                                                          │    
       │  Ejemplos rápidos:                                       │    
       │    [Ecommerce…] [SaaS B2B…] [Restaurante…]              │    
       │                                                          │    
       └────────────────────────────────────────────────────────┘    
                                                                      
       [Hablemos por WhatsApp]   [Agenda 20 min gratis]              
```

**Componentes:**
- `<AiAuditTool client:visible>` (V2-T18 — placeholder en este ticket; renderiza UI básica que no hace nada hasta que la API esté lista)
- Botones secundarios: WhatsAppButton (green) y un link/button a Calendly

**Pasos:**
1. Mantener rotating titles con animación 3D actual.
2. Bajar el tamaño del título ~10% (más sitio para el AI Audit).
3. Insertar el slot del AI Audit Tool entre rotating titles y los CTAs.
4. Cambiar los CTAs: ahora son 2 (WhatsApp primario + Calendly secundario tipo link).
5. Eliminar el chevron animado del fondo.

**AC:**
- [ ] Hero usa solo data de `site.audit` + `site.hero` + `site.contact`.
- [ ] `AiAuditTool` se importa como isla `client:visible`.
- [ ] Dos CTAs visibles en desktop, stack en mobile.
- [ ] No hay referencias a `manifesto`, `eyebrow original`, ni `scrollHint`.

---

## V2-T4
### Navbar update + Footer manifesto

**Objetivo:** Navbar muestra "Cleverum · by Gibran" y solo 3 links (Casos · Servicios · Contacto). Footer muestra frase-manifiesto + socials.

**Dependencias:** V2-T2.

**Archivos a modificar:**
- `src/components/ui/Navbar.astro`
- `src/components/sections/Footer.astro`

**Pasos:**
1. Navbar:
   - Logo Cleverum (igual) + **bajada "by Gibran"** en texto pequeño debajo del nombre
   - Links: `Casos` (#cases), `Servicios` (#services), `Contacto` (#contacto)
   - WhatsAppButton (green, small) a la derecha
2. Footer:
   - Frase grande tipográfica: el manifiesto (`site.footer.manifesto`)
   - Debajo: iconos de socials (LinkedIn, X, GitHub, Email) — placeholders OK
   - Línea horizontal sutil + copy "© 2026 Cleverum · Hecho en México"

**AC:**
- [ ] Navbar tiene 3 links + WhatsApp.
- [ ] Footer tiene la frase del manifiesto destacada como título.
- [ ] Socials linkean a los placeholders (`REPLACE_ME`).
- [ ] Mobile-friendly.

---

# Fase 2 — Contenido real

## V2-T5
### Sección `Cases.astro` (3 cards problem-first)

**Objetivo:** Mostrar los 3 casos reales del portafolio (panel chatbot, web, app móvil) con copy problem-first, stack visible, y placeholders proporcionales para los assets que va a pasar el cliente.

**Dependencias:** V2-T2.

**Archivos a crear:**
- `src/components/sections/Cases.astro`
- `src/components/ui/CaseCard.astro`

**Estructura visual:**

```
Cosas que he construido.
Capturas reales — no mockups, no stock.

┌──────────────────────────────────────────────────────┐
│ 01 / Panel admin WhatsApp                            │
│                                                       │
│ Cliente atendía 200 chats/día a mano.                │
│ Construí el panel que automatiza el 70%.             │
│                                                       │
│ [Imagen / GIF placeholder proporcional 16:10]        │
│                                                       │
│ Stack: React · n8n · Claude · Supabase               │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 02 / Sitio web                                       │
│ … (same pattern)                                     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 03 / App móvil                                       │
│ … (same pattern)                                     │
└──────────────────────────────────────────────────────┘
```

**Diseño placeholder (mientras llegan assets reales):**
- En vez de borde dasheado (anti-premium), usar:
  - Gradient mesh con el accent color de cada caso
  - Un icono representativo centrado (chat / monitor / phone)
  - Texto centrado "Próxima captura · Mockup en proceso"
  - Aspect ratio 16:10 fijo para mantener layout estable

**Pasos:**
1. `CaseCard.astro` recibe `case` como prop.
2. Si `mediaSrc` existe: renderiza `<img>` / `<video>` con `object-fit: cover`.
3. Si `mediaSrc` es null: gradient mesh + icono.
4. Render condicional para `link` si existe.
5. Cards se apilan verticalmente con animación de entrada por scroll (similar a HowWeWork — translateY + fade con `animation-timeline: view()`).

**AC:**
- [ ] Los 3 cards se renderizan con la data de `site.cases.items`.
- [ ] Sin `mediaSrc`, el placeholder es elegante (no dasheado).
- [ ] Reveal al scroll funciona en Chrome/Edge; estático en otros.
- [ ] Sin scroll horizontal en ningún viewport.

---

## V2-T6
### Sección `Services.astro` (3 sprints con pricing público)

**Objetivo:** Mostrar los 3 sprints productizados con precio "desde" público, duración, scope, y CTA WhatsApp por servicio.

**Dependencias:** V2-T2.

**Archivos a crear:**
- `src/components/sections/Services.astro`

**Estructura:**

```
Tres formas de trabajar conmigo.
Sprints productizados. Scope fijo. Sin sorpresas.

┌─────────────────┬─────────────────┬─────────────────┐
│ SPRINT WEB      │ SPRINT AUTO IA  │ SPRINT CHATBOT  │
│                 │                 │                 │
│ Landing o app   │ Workflow + IA   │ Bot + panel     │
│                 │                 │                 │
│ • Bullet 1      │ • Bullet 1      │ • Bullet 1      │
│ • Bullet 2      │ • Bullet 2      │ • Bullet 2      │
│ • Bullet 3      │ • Bullet 3      │ • Bullet 3      │
│                 │                 │                 │
│ ⏱  2-4 sem      │ ⏱  2-3 sem      │ ⏱  3-5 sem      │
│ desde $25K MXN  │ desde $35K MXN  │ desde $45K MXN  │
│                 │                 │                 │
│ [Hablemos]      │ [Hablemos]      │ [Hablemos]      │
└─────────────────┴─────────────────┴─────────────────┘
```

**Pasos:**
1. Grid 3 columnas en desktop (`grid-cols-3`), 1 columna en mobile.
2. Cada card: accent color border-top sutil, header con título y subtítulo, bullets, footer con duration + price.
3. CTA por card pre-llena el mensaje WhatsApp (ej. "¡Hola Gibran! Me interesa el Sprint {{title}}").
4. Hover: leve translateY + glow del accent.

**AC:**
- [ ] 3 cards con data de `site.services.items`.
- [ ] Pricing visible como "desde $X MXN".
- [ ] CTA por servicio dirige a WhatsApp con mensaje custom.

---

## V2-T7
### Sección `AboutGibran.astro` (foto + bio filosa + socials)

**Objetivo:** Sección humana con foto (placeholder por ahora), bio en 4 párrafos cortos, y links a socials.

**Dependencias:** V2-T2.

**Archivos a crear:**
- `src/components/sections/AboutGibran.astro`
- `public/photos/gibran-placeholder.png` (placeholder cuadrado generado vía script o subido por user)

**Estructura:**

```
┌────────────────┬─────────────────────────────────────┐
│                │ Soy Gibran. Single war machine.     │
│                │                                      │
│ [Foto 1:1      │ Construyo sistemas de IA y          │
│  placeholder]  │ automatización para PYMES en        │
│                │ México y LATAM. Solo.               │
│                │                                      │
│                │ Sin agencia. Sin equipo offshore.   │
│                │ Sin junior devs.                     │
│                │                                      │
│                │ Yo te diagnostico. Yo te construyo. │
│                │ Yo te entrego.                       │
│                │                                      │
│                │ Si tu equipo está copiando datos a  │
│                │ mano en 2026, estás quemando dinero.│
│                │                                      │
│                │ → LinkedIn  → X  → GitHub  → Email  │
└────────────────┴─────────────────────────────────────┘
```

**Placeholder de foto:** generar via script (sharp) un PNG cuadrado de 800×800 con un gradient mesh + el monograma "GV" tipográfico grande en el centro. Cuando el cliente pase la foto real, swap simple en `/public/photos/gibran.png`.

**Pasos:**
1. Grid 2 columnas en desktop, stack en mobile.
2. Foto con `border-radius: 24px` y sombra sutil.
3. Bio párrafos con `font-display` ligero, line-height generoso.
4. Socials como iconos lineales (LinkedIn, X, GitHub, Mail) con hover.

**AC:**
- [ ] Sección renderiza data de `site.about`.
- [ ] Foto placeholder visible (proporcional, no dasheado).
- [ ] Socials linkean a `site.socials.*`.

---

## V2-T8
### `ContactCTA.astro` actualizado (Calendly + WhatsApp)

**Objetivo:** CTA final que ofrece 2 carriles de fricción (Calendly + WhatsApp), sin la tarjeta de contacto previa.

**Dependencias:** V2-T2.

**Archivos a modificar:**
- `src/components/sections/ContactCTA.astro`

**Estructura:**

```
                                                                
       ¿Listo para automatizar tu negocio?                       
                                                                
       Empieza con un audit gratis de IA o                        
       agenda 20 min conmigo.                                     
                                                                
       ┌──────────────────────┐  ┌──────────────────────┐         
       │ Hablemos por WhatsApp│  │ Agenda 20 min gratis │         
       └──────────────────────┘  └──────────────────────┘         
       (green primary)            (outline / minimal)             
                                                                
```

**Pasos:**
1. Heading + sub.
2. Dos botones lado a lado en desktop, stack en mobile.
3. WhatsApp button = `variant="secondary"` (green).
4. Calendly button = `variant="minimal"` apuntando a `site.contact.calendly`.

**AC:**
- [ ] Dos CTAs, ambos accesibles.
- [ ] Calendly abre en nueva pestaña.

---

# Fase 3 — AI-readable site

## V2-T9
### `/llms.txt` y `/llms-full.txt`

**Objetivo:** Crear los archivos estandar para que los LLMs ingieran el sitio con contexto curado.

**Dependencias:** V2-T2.

**Archivos a crear:**
- `public/llms.txt` (resumen corto)
- `public/llms-full.txt` (versión markdown completa)

**Contenido de `llms.txt`:**

```
# Cleverum

> Solo developer building AI automation systems for SMBs in Mexico and LATAM.

Founder: Gibran Villarreal
Location: México · LATAM
Languages: Spanish (primary), English

## Services

- Sprint Web — landing pages or web apps, 2-4 weeks, from $25,000 MXN
- Sprint Automatización IA — n8n / Make workflows + AI agents, 2-3 weeks, from $35,000 MXN
- Sprint Chatbot WhatsApp — chatbot + admin panel, 3-5 weeks, from $45,000 MXN

## AI Audit Tool

Free AI-powered business audit at https://cleverum.org/.
Returns 3 specific automation opportunities, ROI estimates,
and recommended stack.

## Stack

Astro, React, TypeScript, Tailwind, n8n, Anthropic Claude,
OpenAI, Cloudflare (Pages + Functions + KV + Workers),
Supabase, React Native

## Contact

- WhatsApp: +52 55 4143 3545
- Email: gibran.villarreal@cleverum.com
- LinkedIn: REPLACE_ME
- GitHub: REPLACE_ME

## Pages

- [/]: Home with hero, AI audit tool, cases, services, about, contact
- [/api/info.json]: Structured site info for AI agents
```

**Contenido de `llms-full.txt`:** versión markdown extensa de cada sección.

**AC:**
- [ ] Ambos archivos servidos en root.
- [ ] Headers `Content-Type: text/plain; charset=utf-8` (configurar en `_headers`).

---

## V2-T10
### JSON-LD expandido (Service ×3 con Offer/Price, FAQPage)

**Objetivo:** Enriquecer el JSON-LD para que Google y LLMs entiendan los servicios + precios + FAQ.

**Dependencias:** V2-T2.

**Archivos a modificar:**
- `src/lib/jsonld.ts`

**Agregar:**
- `Service` × 3 con `provider`, `serviceType`, `offers` (con `priceSpecification`)
- `FAQPage` con 5-8 preguntas frecuentes y respuestas
- `Person` enriquecido con `jobTitle`, `worksFor`, `sameAs` (socials)
- `WebSite` con `potentialAction: SearchAction`

**Preguntas para FAQPage (sugerencia):**
1. ¿Cuánto cuesta un chatbot de WhatsApp?
2. ¿Trabajas con clientes fuera de México?
3. ¿Cuánto tarda implementar una automatización?
4. ¿Trabajas en equipo o solo?
5. ¿Qué stack tecnológico usas?
6. ¿Ofreces mantenimiento después de entregar?
7. ¿Tienen contrato o NDA?

**AC:**
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) valida sin errores.
- [ ] FAQPage aparece en resultados.

---

## V2-T11
### `robots.txt` enriquecido (allow AI bots)

**Objetivo:** Permitir explícitamente a bots de IA legítimos rastrear el sitio (es marketing — si Cleverum aparece en respuestas de Claude / ChatGPT / Perplexity, gana).

**Archivos a modificar:**
- `public/robots.txt`

**Contenido:**

```
User-agent: *
Allow: /

# AI bots — explicit allow
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://cleverum.org/sitemap-index.xml
```

**AC:**
- [ ] Archivo accesible en `/robots.txt`.

---

## V2-T12
### Endpoint `/api/info.json` (structured site info)

**Objetivo:** Endpoint JSON que cualquier agente / herramienta puede consultar para conocer Cleverum.

**Archivos a crear:**
- `functions/api/info.json.ts` (Cloudflare Pages Function)

**Output ejemplo:**

```json
{
  "name": "Cleverum",
  "founder": { "name": "Gibran Villarreal", "role": "indie hacker" },
  "location": "México",
  "services": [...],
  "pricing": [...],
  "contact": {...},
  "ai_audit": {
    "endpoint": "https://cleverum.org/api/audit",
    "description": "Free AI audit returning 3 automation opportunities"
  },
  "updated_at": "2026-05-13T..."
}
```

**Pasos:**
1. Crear la Pages Function que retorna JSON estático.
2. Headers: `Content-Type: application/json`, `Cache-Control: public, max-age=3600`.
3. CORS headers permisivos (`Access-Control-Allow-Origin: *`) — es info pública.

**AC:**
- [ ] `curl https://cleverum.org/api/info.json` retorna JSON válido.

---

# Fase 4 — AI Audit Tool multi-agent

## V2-T13
### Setup Cloudflare Pages Functions + Turnstile + KV bindings

**Objetivo:** Preparar la infra serverless: directorio `functions/`, env vars, KV namespace, Turnstile site key.

**Dependencias:** V2-T1.

**Archivos a crear:**
- `functions/_middleware.ts` (CORS + rate limit helper)
- `functions/types.ts` (Env types)
- `.dev.vars.example` (template para env locales)

**Cloudflare Dashboard setup:**
1. Pages > tu proyecto > Settings > Functions
2. Crear KV namespace `CLEVERUM_KV`:
   - Settings > Functions > KV namespace bindings > Add binding
   - Variable name: `KV` → tu namespace
3. Env vars (Settings > Environment variables):
   - `ANTHROPIC_API_KEY` (encrypted)
   - `TURNSTILE_SECRET_KEY` (encrypted)
   - `TURNSTILE_SITE_KEY` (plain)
   - `RESEND_API_KEY` (encrypted)
   - `DAILY_AUDIT_CAP` (plain, ej. "100")
4. Turnstile: Cloudflare Dashboard > Turnstile > Add site → managed challenge, dominio `cleverum.org` + `localhost` para dev.

**`functions/types.ts`:**

```ts
export interface Env {
  ANTHROPIC_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
  RESEND_API_KEY: string;
  DAILY_AUDIT_CAP: string;
  KV: KVNamespace;
}
```

**`functions/_middleware.ts`:** CORS preflight + log helper.

**AC:**
- [ ] KV namespace bindeado.
- [ ] Env vars configuradas (con valores reales).
- [ ] Turnstile site key disponible en frontend.
- [ ] `npm run dev` no rompe (Wrangler local + Pages dev funciona).

**Notas:**
- Para dev local: instalar `wrangler` y usar `wrangler pages dev dist --kv KV`.
- `.dev.vars` (no en git) contiene las env locales.

---

## V2-T14
### `src/lib/audit/patterns.ts` (los 15 patrones — librería interna)

**Objetivo:** Crear la "biblioteca" de patrones que inyectamos al prompt del Senior Analyst. Esto es la IP de Cleverum.

**Archivos a crear:**
- `src/lib/audit/patterns.ts`

**Estructura:**

```ts
export interface Pattern {
  id: string;
  name: string;
  description: string;
  stack: string[];
  cases: string[];
  roi: string;
  duration: string;
  complexity: 'baja' | 'media' | 'alta';
  category: 'quick-win' | 'strategic';
  sprintRecomendado: 'web' | 'auto' | 'chatbot';
}

export const PATTERNS: Pattern[] = [
  {
    id: 'PATRON_01',
    name: 'WhatsApp + IA para FAQs y ventas',
    description: 'Chatbot con IA que responde preguntas frecuentes, captura leads y recupera carritos abandonados.',
    stack: ['n8n', 'Anthropic Claude Haiku', 'Twilio / WhatsApp Cloud API', 'Supabase'],
    cases: ['ecommerce', 'restaurantes', 'servicios profesionales'],
    roi: '25-40 hrs/mes ahorradas en soporte + conversión +12-18% en abandono',
    duration: '3-5 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'chatbot',
  },
  // ... 14 patrones más
];
```

**Los 15 patrones a redactar (yo los redacto en bruto, tú los apruebas/ajustas):**
1. WhatsApp + IA para FAQs y ventas
2. Sync automático entre 3+ herramientas (Shopify ↔ inventario ↔ contabilidad)
3. Dashboard de KPIs en tiempo real
4. Agente IA para soporte / triage
5. Automatización de cobranza
6. Scraping + análisis de competencia
7. Generación automática de contenido
8. Onboarding automático de clientes
9. Lead enrichment + scoring con IA
10. App móvil con backend serverless
11. RAG sobre documentación interna
12. Voice agent para atención telefónica
13. Automatización de propuestas comerciales
14. Email triage + auto-responder con IA
15. Workflow de aprobaciones internas

**AC:**
- [ ] 15 patrones exportados con la interface tipada.
- [ ] Cada uno tiene stack real + ROI cuantificable + sprint recomendado.

---

## V2-T15
### `src/lib/audit/prompts.ts` (los 3 system prompts)

**Objetivo:** Definir los prompts de los 3 agentes (classifier, analyst, critic) con todo el rigor.

**Archivos a crear:**
- `src/lib/audit/prompts.ts`
- `src/lib/audit/types.ts`

**Types:**

```ts
export interface IndustryClassification {
  industria: string;
  sub_vertical: string;
  maturity_score: number; // 1-10
  signals: string[];
}

export interface Opportunity {
  titulo: string;
  porque: string;
  patron_aplicado: string;
  stack_recomendado: string[];
  roi_estimado: string;
  complejidad: 'baja' | 'media' | 'alta';
  tiempo_implementacion: string;
  sprint_recomendado: 'web' | 'auto' | 'chatbot';
  categoria: 'quick-win' | 'strategic';
  ice_score: {
    impact: number;
    confidence: number;
    ease: number;
    promedio: number;
  };
  confianza: number; // 0-100
}

export interface AuditResult {
  audit_id: string;
  negocio_detectado: string;
  score_madurez: number;
  benchmark: { industria_promedio: number; lider: number; tu_potencial: number };
  oportunidades: Opportunity[];
  recomendacion_prioritaria: { oportunidad_index: number; razon: string };
}
```

**Prompts:** ver doc separado (yo los redacto detallados en V2-T16 antes de implementar). Aquí solo el shell:

```ts
export const INDUSTRY_CLASSIFIER_PROMPT = `...`;
export const SENIOR_ANALYST_PROMPT = `...`; // incluye PATTERNS inyectados
export const CRITIC_PROMPT = `...`;
```

**AC:**
- [ ] Types completos.
- [ ] Prompts redactados con disciplina (en español MX, filosos, schema JSON estricto).

---

## V2-T16
### Endpoint `functions/api/audit.ts` (pipeline multi-agente + streaming SSE)

**Objetivo:** El corazón del feature. Cloudflare Pages Function que orquesta los 3 agentes y stream-ea SSE al cliente.

**Dependencias:** V2-T13, V2-T14, V2-T15.

**Archivos a crear:**
- `functions/api/audit.ts`
- `functions/api/_audit-utils.ts` (helpers compartidos)

**Flujo del endpoint:**

```ts
export async function onRequestPost(context: EventContext<Env>) {
  const { request, env } = context;
  
  // 1) Parse body
  const { input, extra, turnstileToken } = await request.json();
  
  // 1.5) Validar largo del input (hard limit server-side)
  //      Frontend ya limita pero NO confiar en el cliente.
  const MAX_LEN = 500;
  const MIN_LEN = 10;
  const text = String(input ?? '').trim();
  if (text.length < MIN_LEN) return jsonError(400, 'input_too_short');
  if (text.length > MAX_LEN) return jsonError(400, 'input_too_long');
  // El campo `extra` (industria, equipo, stack, pain) también capeado a 200 c/u
  if (extra) {
    for (const v of Object.values(extra)) {
      if (typeof v === 'string' && v.length > 200) {
        return jsonError(400, 'extra_field_too_long');
      }
    }
  }
  
  // 2) Verify Turnstile
  await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, request);
  
  // 3) Rate limit per IP
  const ip = request.headers.get('CF-Connecting-IP');
  await checkRateLimit(env.KV, ip);
  
  // 4) Daily cap
  await checkDailyCap(env.KV, env.DAILY_AUDIT_CAP);
  
  // 5) If input is URL, fetch HTML
  const htmlContext = isUrl(input) ? await fetchHtml(input) : null;
  
  // 6) Stream response (SSE)
  return new Response(
    new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) =>
          controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        
        // AGENTE 1
        send('status', { stage: 'classifying' });
        const industry = await classifyIndustry(env.ANTHROPIC_API_KEY, input, htmlContext);
        send('industry', industry);
        
        // AGENTE 2 (con thinking visible streamed)
        send('status', { stage: 'analyzing' });
        const auditDraft = await senorAnalyst(
          env.ANTHROPIC_API_KEY,
          input, extra, htmlContext, industry,
          { onThinking: (delta) => send('thinking', { delta }) }
        );
        send('opportunities_draft', auditDraft);
        
        // AGENTE 3
        send('status', { stage: 'critiquing' });
        const auditFinal = await criticAndPolish(
          env.ANTHROPIC_API_KEY, auditDraft
        );
        
        // Save to KV
        const auditId = crypto.randomUUID();
        await env.KV.put(`audit:${auditId}`, JSON.stringify(auditFinal), {
          expirationTtl: 60 * 60 * 24 * 7, // 7 días
        });
        
        send('done', { audit_id: auditId, audit: auditFinal });
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    }
  );
}
```

**Helpers:**
- `verifyTurnstile(token, secret, request)` — POST a siteverify
- `checkRateLimit(kv, ip)` — KV key `rate:{ip}` con TTL 24h, throw 429 si existe
- `checkDailyCap(kv, cap)` — KV key `audit:count:{YYYY-MM-DD}`, increment + check
- `isUrl(input)` — regex check
- `fetchHtml(url)` — `fetch(url)` con timeout 5s, extract first 3000 chars del body, strip scripts/styles
- `classifyIndustry(key, input, html)` — call Anthropic con `INDUSTRY_CLASSIFIER_PROMPT`
- `senorAnalyst(key, ..., { onThinking })` — call Anthropic con `SENIOR_ANALYST_PROMPT` + stream
- `criticAndPolish(key, draft)` — call Anthropic con `CRITIC_PROMPT`, regenerate oportunidades con score bajo

**AC:**
- [ ] Endpoint accesible en `/api/audit` (POST).
- [ ] Turnstile valida; sin token → 401.
- [ ] Rate limit 1/IP/24h funciona.
- [ ] SSE stream entrega eventos en orden: status → industry → thinking* → opportunities_draft → done.
- [ ] El JSON final tiene shape de `AuditResult`.
- [ ] Errores manejados con códigos correctos (429, 500).

---

## V2-T17
### Endpoint `functions/api/lead.ts` (validación + Resend + KV store)

**Objetivo:** Capturar email + nombre + audit_id después del audit. Disparar email con la propuesta detallada. Guardar lead.

**Dependencias:** V2-T16.

**Archivos a crear:**
- `functions/api/lead.ts`

**Flujo:**

```ts
export async function onRequestPost(context: EventContext<Env>) {
  const { request, env } = context;
  const { email, nombre, audit_id, comoMeEncontraste } = await request.json();
  
  // 1) Validar email (regex + dominio no temporal)
  if (!isValidEmail(email)) return jsonError(400, 'email_invalid');
  if (isDisposableEmail(email)) return jsonError(400, 'email_disposable');
  
  // 2) Cargar audit del KV
  const auditRaw = await env.KV.get(`audit:${audit_id}`);
  if (!auditRaw) return jsonError(404, 'audit_not_found');
  const audit = JSON.parse(auditRaw);
  
  // 3) Guardar lead
  await env.KV.put(
    `lead:${audit_id}`,
    JSON.stringify({ email, nombre, audit_id, comoMeEncontraste, created_at: Date.now() })
  );
  
  // 4) Disparar email vía Resend
  await sendEmail(env.RESEND_API_KEY, {
    to: email,
    name: nombre,
    audit,
  });
  
  // 5) Notificación a Gibran
  await sendNotificationToGibran(env.RESEND_API_KEY, { lead: { email, nombre }, audit });
  
  return jsonOk({ status: 'sent' });
}
```

**AC:**
- [ ] Endpoint POST `/api/lead`.
- [ ] Validación email + bloqueo de dominios tipo `tempmail.com`.
- [ ] Email entregado en ambos lados (usuario + Gibran).

---

## V2-T18
### `AiAuditTool.tsx` (UI del input + tip section + ejemplos clickables)

**Objetivo:** La isla React principal del AI Audit Tool — input, tip section, examples chips, manejo del SSE.

**Dependencias:** V2-T13.

**Archivos a crear:**
- `src/components/react/AiAuditTool.tsx`
- `src/components/react/audit/AuditInput.tsx`
- `src/components/react/audit/AuditTipBox.tsx`
- `src/components/react/audit/AuditExamplesChips.tsx`

**UI structure:**

```tsx
<AiAuditTool>
  <Pitch />                  // texto encima del input ("Crucé 50+ workflows...")
  <AuditInput
    onSubmit={...}
    disabled={isRunning}
  />
  <AuditTipBox>              // colapsable
    <Hints />                // los 4 hints
  </AuditTipBox>
  <AuditExamplesChips        // 4 ejemplos clickables que populan el input
    onPick={...}
  />
  
  {isRunning && <AuditResult ... />}  // sub-componente que renderiza el stream
</AiAuditTool>
```

**Detalles del input:**
- Textarea autoexpansible (1-3 líneas)
- `maxLength={500}` nativo de HTML — bloquea typing más allá
- Contador de caracteres visible abajo a la derecha: `"342 / 500"`
  - Neutral (text-3) hasta 400
  - Ámbar (warn) de 400 a 480
  - Rojo de 480 a 500
- Submit button **disabled** si `input.length < 10` o `input.length > 500`
- Mensaje hint debajo si está vacío: "Cuéntame en 1-2 frases qué hace tu negocio"
- Cargar Turnstile widget invisible (managed challenge)
- Al submit: parse token, fetch a `/api/audit` con stream, pasar a `AuditResult`
- Si el server responde 400 `input_too_long` (no debería pasar, pero por si acaso): mostrar error inline "El texto es demasiado largo. Sé más conciso."

**Tip box:**
- Colapsada por default; "💡 Cómo darle mejor contexto" como trigger
- Al expandir: 4 bullets + 4 chips de ejemplo

**Examples chips:**
- Clickeable → setea el valor del input + scrollIntoView del input

**AC:**
- [ ] Input funcional, accesible.
- [ ] Turnstile carga.
- [ ] Chips populan input al click.
- [ ] Tip box colapsa/expande con animación suave.

---

## V2-T19
### `AuditResult.tsx` (renderer del resultado streamed)

**Objetivo:** Renderizar progresivamente el SSE: status, industry, thinking (typewriter), oportunidades (reveal cards), maturity score, email gate.

**Dependencias:** V2-T18.

**Archivos a crear:**
- `src/components/react/audit/AuditResult.tsx`
- `src/components/react/audit/ThinkingStream.tsx`
- `src/components/react/audit/OpportunityCard.tsx`
- `src/components/react/audit/MaturityScore.tsx`
- `src/components/react/audit/EmailGate.tsx`

**Flujo visual:**

```
1. [Loading skeleton] →
2. "Cleverum AI analizando…"     (status: classifying)
3. "Industria detectada: ecommerce" + score madurez inicial
4. Thinking stream con typewriter (status: analyzing)
   > Veo ecommerce de ropa MX
   > No detecto integración con WhatsApp
   > ...
5. 3 OpportunityCards reveal con stagger (event: opportunities_draft)
6. MaturityScore con barra animada + benchmark
7. EmailGate visible al final con campo email + nombre
```

**OpportunityCard:**
- Badge (Quick Win / Strategic Bet)
- Titulo + porque
- Stack chips
- ROI + tiempo + complejidad
- ICE score bar
- Recomendación prioritaria → glow extra en la #1

**EmailGate:**
- Email + Nombre + (opcional) "¿cómo me encontraste?"
- Botón "Recibir propuesta detallada"
- Submit → POST a `/api/lead`
- Success → confirmación + CTA a Calendly

**AC:**
- [ ] SSE eventos manejados en orden.
- [ ] Thinking stream visible con typewriter (~30 chars/s).
- [ ] Opportunities reveal con stagger.
- [ ] Maturity score animado.
- [ ] Email gate captura datos y dispara API correctamente.
- [ ] **Despacha estados a `auditState` singleton** (ver V2-T19.5):
  - submit → `setAuditState('processing')`
  - primera oportunidad recibida → `setAuditState('revealing')`
  - evento `done` con maturity score → `setAuditState('done', { score })`
  - tras 2.5s → `setAuditState('idle')`

---

## V2-T19.5
<a id="v2-t195"></a>
### Particle field evolution — audit-reactive + maturity score reveal

**Objetivo:** Las partículas pasan de decoración a narrative. Reaccionan al estado del AI Audit con 4 modos visuales. Cuando llega el resultado, las partículas **forman el número del score de madurez** por unos segundos. En mobile (sin canvas), el `GradientMeshBackground` pulsa con cambio de tinte sincronizado.

**Dependencias:** V2-T18, V2-T19.

**Archivos a crear:**
- `src/lib/auditState.ts` — singleton observer (similar a `scrollProgress`)
- `src/components/three/digitGeometry.ts` — helper para generar posiciones de partículas que formen un número

**Archivos a modificar:**
- `src/components/three/particleShader.ts` — nuevos uniforms + paths para los 4 estados
- `src/components/react/ParticleField.tsx` — subscribe al auditState, lerp del mix, generación de digit positions on-demand
- `src/components/react/audit/AuditResult.tsx` — dispatch de estados a lo largo del stream (ver V2-T19 AC)
- `src/components/ui/GradientMeshBackground.astro` — script que escucha auditState + clase + CSS pulses para mobile

### 1) Singleton `auditState.ts`

```ts
export type AuditState = 'idle' | 'processing' | 'revealing' | 'done';
export interface AuditPayload {
  score?: number; // ej. 4.2 — solo en 'done'
}

type Listener = (state: AuditState, payload: AuditPayload) => void;
const listeners = new Set<Listener>();
let current: AuditState = 'idle';
let payload: AuditPayload = {};

export function setAuditState(s: AuditState, p: AuditPayload = {}) {
  current = s;
  payload = p;
  listeners.forEach((l) => l(s, p));
}

export function subscribeAuditState(l: Listener): () => void {
  listeners.add(l);
  l(current, payload);
  return () => listeners.delete(l);
}
```

### 2) Comportamiento por estado

| Estado | Visual | Lógica de shader |
|---|---|---|
| `idle` | Cycling con scroll (estado actual) | `uAuditState=0`, scroll-driven `uProgress` |
| `processing` | Convergen al centro en vórtice. Rotación ×3. Tinte iris dominante. | `uAuditState=1`, `pos = mix(pos, center, 0.7)`, mayor swirl |
| `revealing` | Burst hacia afuera. Tinte verde. Expansión radial. | `uAuditState=2`, `pos *= 1.5` con easing |
| `done` | Las partículas **forman temporalmente el número del score** (ej. "4.2") por ~2.5s, luego desvanecen a idle. | `uAuditState=3`, `pos = mix(pos, digitPosition, uAuditMix)` |

### 3) Generación del número con partículas

Helper `digitGeometry.ts`:

```ts
/**
 * Renderiza el número en un canvas off-screen, lee pixels alpha,
 * samplea N posiciones donde la alpha > umbral, y devuelve Float32Array
 * de posiciones 3D distribuidas en el plano de la cámara.
 *
 * Las partículas que no caben en el número se distribuyen
 * orbitando alrededor (radio mayor) — siempre se usan TODAS.
 */
export function generateDigitPositions(
  number: string,
  count: number,
  worldSize = { width: 6, height: 3 },
): Float32Array;
```

Implementación:
1. Crear canvas 2D off-screen (ej. 512×256)
2. Render del número con la font display, color blanco, grueso
3. `getImageData()` y filtrar pixels con `alpha > 128`
4. Samplear hasta `count * 0.7` pixels, convertir a coords del espacio 3D (centrar, escalar)
5. El 30% restante: distribuir en círculo orbital alrededor, mismo radio que cloud

### 4) Shader updates

Nuevos uniforms en `particleShader.ts`:

```glsl
uniform float uAuditState;   // 0=idle, 1=processing, 2=revealing, 3=done
uniform float uAuditMix;     // 0..1 transición suave
attribute vec3 aDigit;       // posiciones del número (solo se usan en done)
```

En el vertex shader, agregar branches según `uAuditState`:

```glsl
// ... posición base (cloud/grid/constellation) calculada como antes ...

if (uAuditState > 0.5 && uAuditState < 1.5) {
  // processing: converger al centro
  pos = mix(pos, vec3(0.0, 0.0, 0.0), uAuditMix * 0.7);
} else if (uAuditState > 1.5 && uAuditState < 2.5) {
  // revealing: expandir
  pos *= mix(1.0, 1.5, uAuditMix);
} else if (uAuditState > 2.5) {
  // done: formar el número
  pos = mix(pos, aDigit, uAuditMix);
}
```

En fragment shader, ajustar tinte según estado: iris para processing, verde para revealing.

### 5) ParticleField.tsx — wiring

- Suscribirse al `auditState` con `useEffect`
- Guardar `targetMix` y `currentMix` en refs
- En `useFrame`, lerp `currentMix` hacia `targetMix` (suaviza transiciones)
- Cuando llega `done` con `score`:
  1. Llamar `generateDigitPositions(score.toFixed(1), 6000)`
  2. Actualizar el `aDigit` BufferAttribute
  3. Lerp `uAuditMix` 0 → 1 en ~0.6s
  4. Hold 2.5s
  5. Lerp `uAuditMix` 1 → 0 + transición a 'idle'

### 6) GradientMeshBackground mobile pulses

Agregar al `.astro`:

```astro
<script is:inline>
  // Tiny client script — solo en mobile (donde no hay ParticleField)
  if (typeof window !== 'undefined') {
    import('../../lib/auditState').then(({ subscribeAuditState }) => {
      const el = document.querySelector('.gradient-mesh');
      if (!el) return;
      subscribeAuditState((state) => {
        el.dataset.auditState = state;
      });
    });
  }
</script>
```

CSS:

```css
.gradient-mesh[data-audit-state='processing'] { animation: mesh-pulse-iris 1.4s ease-in-out infinite; }
.gradient-mesh[data-audit-state='revealing']  { animation: mesh-pulse-green 1.2s ease-in-out infinite; }
.gradient-mesh[data-audit-state='done']       { animation: mesh-flash 0.8s ease-out; }

@keyframes mesh-pulse-iris {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(-15deg) brightness(1.2); }
}
@keyframes mesh-pulse-green {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(60deg) brightness(1.3); }
}
@keyframes mesh-flash {
  0% { filter: brightness(1); }
  30% { filter: brightness(1.5); }
  100% { filter: brightness(1); }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-mesh[data-audit-state] { animation: none !important; }
}
```

**AC:**
- [ ] `idle` → `processing` al hacer submit del audit (transición ~0.6s)
- [ ] Durante `processing` las partículas convergen visiblemente al centro, mantienen energía
- [ ] `revealing` al recibir primera oportunidad — burst de expansión
- [ ] `done` con score (ej. 4.2) — partículas **forman el número** durante ~2.5s
- [ ] Después del reveal, transición suave de vuelta a `idle` (cycling con scroll)
- [ ] En mobile: gradient mesh pulsa con cambio de tinte sincronizado con el audit
- [ ] 60fps mantenidos en desktop M1
- [ ] `prefers-reduced-motion`: skip todos los pulses y mantén estado idle siempre
- [ ] Si el usuario cierra el audit antes de recibir, particles vuelven a idle limpiamente

**Notas técnicas:**
- El digit map se genera **una sola vez por audit** (no en cada frame).
- `aDigit` se actualiza con `geometry.attributes.aDigit.needsUpdate = true`.
- Si el score es `null` o inválido, skip el efecto `done` y va directo a `idle`.
- Esta es la "firma visual" de Cleverum AI — vale 1 día de trabajo pero es lo que la gente recordará y compartirá.

---

## V2-T20
### Email template del reporte detallado (HTML inline)

**Objetivo:** Email HTML que recibe el usuario después del audit, con la propuesta detallada + bonus prometido.

**Archivos a crear:**
- `functions/api/_email-template.ts`

**Template HTML estilo "newsletter clean":**

```
[Header con logo Cleverum + bajada "by Gibran"]

Hola {{nombre}},

Aquí está el análisis completo que te prometí. 
Tu negocio: {{negocio_detectado}}.
Tu score actual de madurez de automatización: {{score}}/10.

══════════════════════════════════════
LAS 3 OPORTUNIDADES (en orden de impacto):
══════════════════════════════════════

01. {{oportunidad_1.titulo}}
{{oportunidad_1.porque}}
ROI estimado: {{oportunidad_1.roi_estimado}}
Stack: {{oportunidad_1.stack_recomendado}}
Sprint recomendado: {{sprint}} (desde {{price}})

[Repeat para 02 y 03]

══════════════════════════════════════
TU REGALO
══════════════════════════════════════

→ Una sesión de 20 minutos conmigo, gratis.
  Agenda aquí: [Calendly link]
  
→ Si arrancamos en los próximos 14 días:
  10% off en tu primer sprint.

══════════════════════════════════════

— Gibran Villarreal
   Cleverum · single war machine
   gibran.villarreal@cleverum.com

[Footer con manifiesto + socials]
```

**Pasos:**
1. Template HTML inline (sin CSS externo — emails no lo soportan bien).
2. Función `buildEmailHtml(audit, nombre, calendlyUrl)`.
3. Subject: `Tu audit de IA — 3 ideas para automatizar tu negocio`.

**AC:**
- [ ] Email se ve OK en Gmail / Outlook / Apple Mail.
- [ ] Links funcionan.
- [ ] Imágenes inline o hospedadas en cleverum.org.

---

# Fase 5 — Polish + deploy

## V2-T21
### Responsive review + animaciones polish

**Objetivo:** Validar 5 viewports + ajustar lo que necesite. Animaciones sin jitter.

**AC:**
- [ ] 375 / 768 / 1024 / 1440 / 1920 sin scroll horizontal.
- [ ] AI Audit Tool funcional en mobile.
- [ ] Tap targets ≥ 44px en mobile.

---

## V2-T22
### Lighthouse pass + sitemap update

**Objetivo:** 95+ Performance / 100 SEO / 100 A11y / 100 BP.

**Pasos:**
- `npm run build && npm run preview`
- Lighthouse en incógnito mobile
- Iterar lo que falte

**AC:**
- [ ] Performance ≥ 95
- [ ] SEO = 100
- [ ] A11y = 100
- [ ] BP = 100

---

## V2-T23
### Deploy a Cloudflare Pages + dominio cleverum.org + env vars

**Pasos:**
1. Push del branch → CF Pages preview.
2. Configurar env vars en CF Dashboard (ver V2-T13).
3. Configurar KV binding.
4. Configurar dominio custom `cleverum.org`.
5. Activar Cloudflare Web Analytics.
6. Smoke test end-to-end del audit en prod.

**AC:**
- [ ] `https://cleverum.org` sirve la landing v2.
- [ ] AI Audit Tool funciona end-to-end en prod.
- [ ] Emails llegan vía Resend.
- [ ] Web Analytics activado.

---

## Convenciones globales (heredadas de dev-plan.md)

- 1 PR por ticket, título con `[V2-T#]`.
- Commits convencionales.
- `npm run build && npm run check && npm run lint` antes de merge.
- Capturas obligatorias en PRs que afecten UI.
- Cualquier env var nueva → documentada en `.dev.vars.example`.
