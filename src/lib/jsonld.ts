import { site } from '~/content/site';

const URL = site.meta.url;

const ID = {
  org: `${URL}#organization`,
  website: `${URL}#website`,
  person: `${URL}#gibran`,
  service: (id: string) => `${URL}#service-${id}`,
  faq: `${URL}#faq`,
} as const;

interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': Record<string, unknown>[];
}

function isReal(url: string): boolean {
  return !url.includes('REPLACE_ME');
}

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: '¿Cuánto cuesta un chatbot de WhatsApp?',
    a: 'El Sprint Chatbot WhatsApp empieza desde $45,000 MXN. Incluye chatbot con IA conversacional, panel admin para tu equipo, e integraciones a tu CRM, ERP o e-commerce. Implementación en 3-5 semanas. Precio público y scope fijo, sin sorpresas.',
  },
  {
    q: '¿Trabajas con clientes fuera de México?',
    a: 'Sí. Trabajo con PYMES en todo LATAM — Colombia, Chile, Argentina, Perú, Costa Rica, etc. Toda la comunicación es en español. Las herramientas usadas son cross-border (WhatsApp Business Cloud API, Stripe, n8n, Make) y los pagos se manejan en MXN o USD según el caso.',
  },
  {
    q: '¿Cuánto tarda implementar una automatización?',
    a: 'Un Sprint Automatización IA tarda 2 a 3 semanas y cubre: diagnóstico del proceso, diseño del flujo, implementación en n8n o Make, integración a tus herramientas existentes, más un agente IA conversacional. El Sprint Web tarda 2-4 semanas y el Sprint Chatbot WhatsApp tarda 3-5 semanas.',
  },
  {
    q: '¿Trabajas solo o en equipo?',
    a: 'Solo. Un único developer de stack completo (Gibran Villarreal). Sin agencia, sin equipo offshore, sin junior devs, sin reuniones de descubrimiento de 8 horas. Yo te diagnostico, yo te construyo, yo te entrego. Esa es la propuesta de valor de Cleverum.',
  },
  {
    q: '¿Qué stack tecnológico usas?',
    a: 'Frontend: Astro, React, TypeScript, Tailwind. Mobile: React Native con Expo. Automatización: n8n y Make. IA: Anthropic Claude (Haiku, Sonnet, Opus) y OpenAI. Backend e infraestructura: Cloudflare Pages + Functions + KV + Workers, Supabase, Resend. WhatsApp: Business Cloud API.',
  },
  {
    q: '¿Ofreces mantenimiento después de entregar?',
    a: 'Sí. Después del sprint puedo entrar en un retainer mensual flexible para soporte, mantenimiento, monitoreo y mejoras incrementales. El plan se acuerda al cierre del sprint según el alcance y carga real del sistema entregado.',
  },
  {
    q: '¿Tienen contrato o NDA?',
    a: 'Sí. Cada sprint se cierra con un contrato simple que define scope, plazos, entregables y forma de pago. NDA disponible bajo solicitud — útil cuando trabajamos con datos sensibles, integraciones a sistemas internos, o procesos propietarios del cliente.',
  },
];

export function buildJsonLd(): JsonLdGraph {
  const { contact, brand, services: siteServices, socials } = site;

  const sameAs = [socials.linkedin, socials.twitter, socials.github].filter(isReal);

  const organization = {
    '@type': 'Organization',
    '@id': ID.org,
    name: brand.name,
    url: URL,
    logo: `${URL}/favicon.svg`,
    image: `${URL}/og.png`,
    description: site.meta.description,
    founder: { '@id': ID.person },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: contact.phoneTel,
      email: contact.email,
      availableLanguage: ['Spanish'],
      areaServed: ['MX', 'LATAM'],
    },
    areaServed: [
      { '@type': 'Country', name: 'México' },
      { '@type': 'Place', name: 'Latinoamérica' },
    ],
    sameAs,
  };

  const website = {
    '@type': 'WebSite',
    '@id': ID.website,
    url: URL,
    name: brand.name,
    description: site.meta.description,
    inLanguage: 'es-MX',
    publisher: { '@id': ID.org },
  };

  const person = {
    '@type': 'Person',
    '@id': ID.person,
    name: contact.name,
    email: contact.email,
    telephone: contact.phoneTel,
    url: URL,
    worksFor: { '@id': ID.org },
    jobTitle: 'Founder & Technology Lead',
    knowsAbout: [
      'AI automation',
      'WhatsApp chatbots',
      'Workflow automation',
      'n8n',
      'Anthropic Claude',
      'Web development',
      'React Native',
    ],
    sameAs,
  };

  const services = siteServices.items.map((s) => {
    return {
      '@type': 'Service',
      '@id': ID.service(s.id),
      name: s.title,
      serviceType: s.subtitle,
      description: s.bullets.join('. ') + '.',
      provider: { '@id': ID.org },
      areaServed: [
        { '@type': 'Country', name: 'México' },
        { '@type': 'Place', name: 'Latinoamérica' },
      ],
      audience: {
        '@type': 'Audience',
        audienceType: 'Pequeñas y medianas empresas',
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        url: `${URL}/#services`,
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'MXN',
          description: 'Cotización personalizada según alcance',
        },
      },
    } as Record<string, unknown>;
  });

  const faqPage = {
    '@type': 'FAQPage',
    '@id': ID.faq,
    inLanguage: 'es-MX',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, person, faqPage, ...services],
  };
}
