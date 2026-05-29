/**
 * Fuente única de verdad para todo el contenido editable de la landing.
 * Editar aquí = editar la landing. Ningún componente debe hardcodear texto que ya viva en este archivo.
 */

export const site = {
  meta: {
    title: 'Cleverum — Sistemas de IA y automatización para PYMES',
    description:
      'Construyo sistemas que ponen tu negocio en piloto automático. Trabajo solo, hago todo: desde el diseño hasta la entrega.',
    url: 'https://cleverum.org',
    locale: 'es_MX',
    author: 'Gibran Villarreal',
  },

  brand: {
    name: 'Cleverum',
    bajada: 'por Gibran Villarreal',
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
    subline:
      'Gratis diagnóstico con IA en 30 segundos. Tres ideas concretas para automatizar tu negocio.',
    ctaLabel: 'Diagnostica mi negocio',
    microNote: '30 segundos · gratis · sin compromiso',
    ctaPrimary: 'Hablemos por WhatsApp',
  },

  audit: {
    eyebrow: 'DIAGNÓSTICO GRATIS · 30 SEGUNDOS',
    heading: 'Diagnóstico inteligente de tu negocio.',
    intro:
      'Te regalo 3 ideas concretas en 30 segundos. Mientras más me cuentes, mejor es el análisis.',

    groups: {
      business: 'Cuéntame de tu negocio',
      context: 'Contexto extra (opcional · mejora mucho el análisis)',
      contact: 'Para enviarte el reporte',
    },

    fields: {
      inputPlaceholder: 'Tu URL o describe tu negocio en 1-2 líneas',
      industria: 'Industria',
      equipo: 'Tamaño de equipo',
      stack: 'Herramientas actuales',
      pain: 'Tu mayor dolor hoy',
      nombre: 'Nombre',
      empresa: 'Empresa',
      email: 'Email',
      telefono: 'Teléfono',
    },

    submitLabel: 'Analizar mi negocio',
    microNote:
      'Sin email te muestro el resultado aquí mismo, pero no puedo enviarte el reporte detallado.',

    maxInputLength: 500,
    minInputLength: 10,
    maxFieldLength: 200,

    examples: [
      'Tienda en línea de ropa, atiendo 200 chats al día a mano',
      'Software para empresas, integrar cada cliente nuevo me toma 3 horas',
      'Restaurante que contesta WhatsApp a mano y maneja 4 apps de delivery',
      'Despacho legal, copio datos entre 5 sistemas todas las semanas',
    ],
  },

  cases: {
    heading: 'Cosas que he construido.',
    subheading: 'Capturas reales del producto entregado, no plantillas.',
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
    subheading: 'Proyectos con precio claro y entregables definidos.',
    items: [
      {
        id: 'web',
        title: 'Sitio web',
        subtitle: 'Landing o web app',
        bullets: [
          'Hasta N pantallas o secciones',
          'Diseño + desarrollo + deploy',
          'Performance & SEO incluidos',
        ],
        duration: '2-4 semanas',
        priceFrom: '$15,000 MXN',
        accent: 'blue',
      },
      {
        id: 'auto',
        title: 'Automatización con IA',
        subtitle: 'Workflow + agente IA',
        bullets: [
          'Diagnóstico + diseño del flujo',
          'Implementación en n8n / Make',
          'Integraciones a tus herramientas + 1 agente IA',
        ],
        duration: '2-3 semanas',
        priceFrom: '$22,000 MXN',
        accent: 'iris',
      },
      {
        id: 'chatbot',
        title: 'Chatbot de WhatsApp',
        subtitle: 'Bot + panel admin',
        bullets: [
          'Chatbot con IA conversacional',
          'Panel admin para tu equipo',
          'Integraciones a CRM / ERP / e-commerce',
        ],
        duration: '3-5 semanas',
        priceFrom: '$28,000 MXN',
        accent: 'green',
      },
    ],
  },

  about: {
    heading: 'Soy Gibran. Yo solo, todo el stack.',
    photoSrc: null as string | null,
    paragraphs: [
      'Construyo sistemas de IA y automatización para PYMES en México y LATAM. Solo.',
      'Sin agencias intermediarias, sin equipos lejanos, sin juntas eternas para entender lo que quieres.',
      'Yo te diagnostico. Yo te construyo. Yo te entrego.',
      'Si tu equipo sigue copiando datos a mano entre sistemas, estás perdiendo tiempo y dinero todos los días.',
    ],
  },

  finalCta: {
    heading: '¿Listo para automatizar tu negocio?',
    sub: 'Empieza con el diagnóstico gratis de arriba ↑ o escríbeme directo desde el botón de WhatsApp del menú.',
  },

  footer: {
    manifesto: 'Un solo dev. Todo el stack. Cero excusas.',
    note: 'Hecho en México · 2026',
  },
} as const;

export type Site = typeof site;
export type Service = (typeof site.services.items)[number];
export type Case = (typeof site.cases.items)[number];
