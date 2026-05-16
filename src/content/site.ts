/**
 * Fuente única de verdad para todo el contenido editable de la landing.
 * Editar aquí = editar la landing. Ningún componente debe hardcodear texto que ya viva en este archivo.
 */

export const site = {
  meta: {
    title: 'Cleverum — Automatización, desarrollo e IA para tu negocio',
    description:
      'Soluciones inteligentes para negocios que evolucionan. Tres marcas, una visión: automatización con IA, desarrollo web y mobile, y chatbots de WhatsApp.',
    url: 'https://cleverum.org',
    locale: 'es_MX',
  },

  contact: {
    name: 'Gibran Villarreal',
    email: 'gibran.villarreal@cleverum.com',
    phoneDisplay: '+52 55 4143 3545',
    phoneTel: '+525541433545',
    whatsapp: {
      number: '5215541433545',
      prefilledMessage:
        '¡Hola! Vi tu landing y me gustaría saber más sobre cómo pueden ayudarme.',
    },
  },

  hero: {
    // Frases rotativas que protagonizan el hero.
    // Sintaxis: encierra entre asteriscos *...* las palabras que deben pintarse en gradient-text.
    // Mantener cada frase ≤ 70 caracteres para que respire en 2–3 líneas.
    rotatingTitles: [
      'Automatiza tus conversaciones y deja de perder ventas en *WhatsApp*.',
      'Lanza la *app móvil* que tu negocio necesita en semanas, no años.',
      'Conecta tus sistemas y olvídate de *copiar datos* a mano.',
      'Pregunta a tu *IA* y obtén el reporte que antes tardaba días.',
      'Atiende a tus clientes *24/7* sin contratar otro agente.',
    ],
    ctaLabel: 'Hablemos por WhatsApp',
  },

  nav: {
    links: [
      { label: 'Marcas', href: '#brands' },
      { label: 'Cómo trabajamos', href: '#how' },
      { label: 'Resultados', href: '#why' },
      { label: 'Contacto', href: '#contacto' },
    ],
  },

  brands: [
    {
      id: 'devindry',
      number: '01',
      name: 'Devindry',
      tagline: 'Desarrollo web y mobile',
      description:
        'Páginas, e-commerce y apps que convierten. Diseño moderno, performance impecable y campañas que escalan.',
      accent: 'blue',
      youtubeId: null as string | null,
      logoSrc: '/logos/devindry-logo.png' as string | null,
      videoPlaceholder: 'Próximamente: demo de un caso de desarrollo mobile',
      bullets: [
        'Páginas web y e-commerce optimizados',
        'Apps móviles iOS y Android',
        'Campañas Google Ads y redes sociales',
      ],
      ctaMessage: '¡Hola! Quiero saber más sobre Devindry — desarrollo web y mobile.',
    },
    {
      id: 'cleverum',
      number: '02',
      name: 'Cleverum',
      tagline: 'Automatización con IA para negocios',
      description:
        'Diagnosticamos procesos, los automatizamos con IA y conectamos tus herramientas. Menos burocracia, más resultados.',
      accent: 'iris',
      youtubeId: null as string | null,
      logoSrc: '/logos/cleverum-logo.png' as string | null,
      videoPlaceholder: 'Próximamente: caso real de automatización con IA',
      bullets: [
        'Automatización de procesos end-to-end',
        'Integración de IA avanzada',
        'Análisis y reportes en tiempo real',
      ],
      ctaMessage: '¡Hola! Quiero automatizar mi negocio con Cleverum.',
    },
    {
      id: 'wabbi',
      number: '03',
      name: 'Wabbi',
      tagline: 'Chatbots inteligentes para WhatsApp',
      description:
        'Atención 24/7, segmentación y conversiones reales. Tu canal de mayor engagement, ahora automático.',
      accent: 'green',
      youtubeId: null as string | null,
      logoSrc: '/logos/wabbi-logo.png' as string | null,
      videoPlaceholder: 'Próximamente: demo de chatbot WhatsApp',
      bullets: [
        'Atención automática 24/7',
        'Respuestas inteligentes con IA',
        'Segmentación y campañas personalizadas',
      ],
      ctaMessage: '¡Hola! Quiero un chatbot de WhatsApp con Wabbi.',
    },
  ],

  howWeWork: {
    heading: 'Cómo trabajamos',
    subheading: 'Un proceso simple, medible y enfocado en resultados.',
    steps: [
      {
        step: '01',
        title: 'Descubrimiento',
        body: 'Entendemos tu negocio, procesos y métricas reales.',
      },
      {
        step: '02',
        title: 'Diseño',
        body: 'Diseñamos la solución a medida y validamos contigo antes de construir.',
      },
      {
        step: '03',
        title: 'Implementación',
        body: 'Construimos, integramos y entrenamos a tu equipo.',
      },
      {
        step: '04',
        title: 'Resultados',
        body: 'Medimos, iteramos y escalamos lo que funciona.',
      },
    ],
  },

  differentiators: {
    heading: 'Construido para resultados',
    subheading:
      'No vendemos horas — entregamos sistemas que funcionan, se miden y escalan.',
    items: [
      {
        title: 'Soluciones a la medida',
        body: 'Diagnosticamos antes de construir. Cada solución se diseña para tu flujo, no al revés.',
        icon: 'target',
      },
      {
        title: 'Tecnología de vanguardia',
        body: 'IA generativa, automatización end-to-end, WebGL. Usamos lo bueno cuando aporta — sin moda por moda.',
        icon: 'spark',
      },
      {
        title: 'Enfocados en resultados',
        body: 'KPIs claros, ROI medible y deadlines reales desde el día uno. Sin entregables vacíos.',
        icon: 'chart',
      },
      {
        title: 'Innovación sin límites',
        body: 'Si la herramienta que necesitas no existe todavía, la construimos contigo.',
        icon: 'compass',
      },
    ],
    mediaPlaceholder:
      'Espacio para una imagen — caso real, screenshot del producto, o foto del equipo en acción.',
  },

  capabilities: [
    'IA generativa',
    'Automatización',
    'Chatbots WhatsApp',
    'E-commerce',
    'Apps iOS',
    'Apps Android',
    'Google Ads',
    'Redes sociales',
    'UI/UX',
    'Integraciones API',
    'Dashboards',
    'Reportes en tiempo real',
    'CRM',
    'Marketing digital',
    'Webhooks & n8n',
  ],

  contactCta: {
    heading: '¿Listo para automatizar tu negocio?',
    subheading:
      'Cuéntame qué quieres lograr y diseñamos juntos la solución. Respuesta inmediata por WhatsApp.',
    ctaLabel: 'Hablemos por WhatsApp ahora',
  },

  footer: {
    rights: 'Todos los derechos reservados.',
    note: 'Hecho con cariño en México.',
    socials: [] as { label: string; href: string }[],
  },
} as const;

export type Site = typeof site;
export type Brand = (typeof site.brands)[number];
export type BrandAccent = Brand['accent'];

/** Mapa accent → CSS variable name del token de color */
export const accentVar: Record<BrandAccent, string> = {
  blue: 'var(--color-brand-blue)',
  iris: 'var(--color-brand-iris)',
  green: 'var(--color-accent-go)',
};
