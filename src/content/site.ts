/**
 * Fuente única de verdad para todo el contenido editable de la landing.
 * Editar aquí = editar la landing. Ningún componente debe hardcodear texto que ya viva en este archivo.
 */

export const site = {
  meta: {
    title: 'Cleverum — Sistemas de IA y automatización para PYMES',
    description:
      'Construimos sistemas que ponen tu negocio en piloto automático. Diseñamos, desarrollamos y entregamos IA y automatización para PYMES en México y LATAM.',
    url: 'https://cleverum.org',
    locale: 'es_MX',
    author: 'Cleverum',
  },

  brand: {
    name: 'Cleverum',
    bajada: 'Sistemas inteligentes',
    location: 'México · LATAM',
  },

  contact: {
    name: 'Gibran Villarreal',
    email: 'gibran.villarreal@cleverum.com',
    phoneDisplay: '+52 55 4143 3545',
    phoneTel: '+525541433545',
    whatsapp: {
      number: '5215541433545',
      prefilledMessage: '¡Hola! Vi el sitio de Cleverum y quiero hablar sobre un proyecto.',
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
    subline: 'Diagnóstico con IA en ~1 minuto. Gratis.',
    ctaLabel: 'Diagnostica mi negocio',
    ctaPrimary: 'Hablemos por WhatsApp',
  },

  audit: {
    eyebrow: 'DIAGNÓSTICO GRATIS · ~1 MINUTO',
    heading: 'Diagnóstico de tu negocio.',

    groups: {
      business: 'Cuéntanos de tu negocio',
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
      'Sin email te mostramos el resultado aquí mismo, pero no podemos enviarte el reporte detallado.',

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
    heading: 'Lo que construimos.',
    items: [
      {
        id: 'whatsapp-panel',
        number: '01',
        problem: 'Cliente atendía 200 chats/día a mano.',
        solution: 'Panel admin para chatbots WhatsApp con IA.',
        impact: 'Automatiza el 70% del soporte.',
        stack: ['React', 'n8n', 'Claude', 'Supabase', 'WhatsApp Business API'],
        mediaSrc: null as string | null,
        videoId: 'DS8BRbcWfKo' as string | null,
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
        videoId: null as string | null,
        link: null as string | null,
      },
      {
        id: 'automation',
        number: '03',
        problem: 'Equipo de ventas pasaba 3 horas al día copiando datos entre CRM y ERP.',
        solution: 'Workflow que sincroniza todo en tiempo real, sin que nadie toque nada.',
        impact: '15 horas/semana recuperadas. Cero discrepancias de stock.',
        stack: ['n8n', 'HubSpot API', 'Contpaqi', 'webhooks'],
        mediaSrc: null as string | null,
        videoId: null as string | null,
        link: null as string | null,
      },
    ],
  },

  services: {
    heading: 'En qué te ayudamos.',
    disclaimer: 'Cotización personalizada según el alcance de tu proyecto.',
    items: [
      {
        id: 'web',
        title: 'Sitio web',
        subtitle: 'Tu presencia digital, lista para vender',
        bullets: [
          'Diseño moderno que carga rápido y convierte visitantes en leads',
          'Conectado a tu CRM o ERP — los leads aterrizan donde tu equipo trabaja',
          'Preparado para Google Ads y Meta Ads — con tracking de conversiones medidas',
          'SEO técnico incluido — Google te encuentra',
        ],
        duration: '2-4 semanas',
        inversion: 1,
        idealFor: 'Negocios que quieren un funnel de conversión completo',
        accent: 'blue',
      },
      {
        id: 'auto',
        title: 'Automatización con IA',
        subtitle: 'Procesos que se ejecutan solos',
        bullets: [
          'Onboarding de clientes nuevos: alta en sistemas + contratos + bienvenida sin que muevas un dedo',
          'Tu inbox de correos triado y respondido en automático',
          'Reportes diarios o semanales armados solos con los datos de tus sistemas',
          'Sync entre tus apps: ventas, contabilidad, inventario, CRM',
        ],
        duration: '2-3 semanas',
        inversion: 2,
        idealFor: 'Equipos que pierden horas en tareas repetitivas entre sistemas',
        accent: 'iris',
      },
      {
        id: 'chatbot',
        title: 'Chatbot de WhatsApp',
        subtitle: 'Atiende a tus clientes 24/7 sin contratar más gente',
        bullets: [
          'Chatbot con IA conversacional que entiende tu negocio',
          'Panel admin para que tu equipo intervenga cuando quiera',
          'Integrado a tu CRM, ERP o e-commerce',
          'Recupera carritos, agenda citas, califica leads automáticamente',
        ],
        duration: '3-5 semanas',
        inversion: 2,
        idealFor: 'Negocios con volumen alto de mensajes en WhatsApp',
        accent: 'green',
      },
    ],
  },

  about: {
    heading: 'Somos Cleverum.',
    photoSrc: null as string | null,
    paragraphs: [
      'Construimos sistemas de IA y automatización para PYMES en México y LATAM.',
      'Sin agencias intermediarias, sin equipos lejanos, sin juntas eternas para entender lo que necesitas.',
      'Te diagnosticamos. Te construimos. Te entregamos.',
      'Si tu equipo sigue copiando datos a mano entre sistemas, estás perdiendo tiempo y dinero todos los días.',
    ],
  },

  finalCta: {
    heading: 'Automatiza tu negocio, ¡ya!',
    sub: 'Empieza con el diagnóstico gratis de arriba ↑ o escríbenos directo desde el botón de WhatsApp del menú.',
  },

  footer: {
    manifesto: 'Un equipo. Todo el stack. Cero excusas.',
    note: 'Hecho en México · 2026',
  },
} as const;

export type Site = typeof site;
export type Service = (typeof site.services.items)[number];
export type Case = (typeof site.cases.items)[number];
