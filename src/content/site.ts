/**
 * Fuente única de verdad para todo el contenido editable de la landing.
 * Editar aquí = editar la landing. Ningún componente debe hardcodear texto que ya viva en este archivo.
 */

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
    calendly: 'https://calendly.com/REPLACE_ME',
  },

  socials: {
    linkedin: 'https://linkedin.com/in/REPLACE_ME',
    twitter: 'https://x.com/REPLACE_ME',
    github: 'https://github.com/REPLACE_ME',
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
    maxInputLength: 500,
    minInputLength: 10,
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
        mediaSrc: null as string | null,
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
    photoSrc: null as string | null,
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
