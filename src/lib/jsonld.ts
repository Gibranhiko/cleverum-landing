import { site } from '~/content/site';

const URL = site.meta.url;
const ID = {
  org: `${URL}#organization`,
  website: `${URL}#website`,
  person: `${URL}#gibran`,
  service: (id: string) => `${URL}#service-${id}`,
  video: (id: string) => `${URL}#video-${id}`,
} as const;

interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': Record<string, unknown>[];
}

export function buildJsonLd(): JsonLdGraph {
  const organization = {
    '@type': 'Organization',
    '@id': ID.org,
    name: 'Cleverum',
    url: URL,
    logo: `${URL}/favicon.svg`,
    image: `${URL}/og.png`,
    description: site.meta.description,
    founder: { '@id': ID.person },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: site.contact.phoneTel,
      email: site.contact.email,
      availableLanguage: ['Spanish'],
      areaServed: 'MX',
    },
    sameAs: [] as string[],
  };

  const website = {
    '@type': 'WebSite',
    '@id': ID.website,
    url: URL,
    name: 'Cleverum',
    description: site.meta.description,
    inLanguage: 'es-MX',
    publisher: { '@id': ID.org },
  };

  const person = {
    '@type': 'Person',
    '@id': ID.person,
    name: site.contact.name,
    email: site.contact.email,
    telephone: site.contact.phoneTel,
    worksFor: { '@id': ID.org },
    jobTitle: 'Founder & Technology Lead',
  };

  const services = site.brands.map((brand) => ({
    '@type': 'Service',
    '@id': ID.service(brand.id),
    name: brand.name,
    serviceType: brand.tagline,
    description: brand.description,
    provider: { '@id': ID.org },
    areaServed: { '@type': 'Country', name: 'México' },
    audience: { '@type': 'Audience', audienceType: 'Pequeñas y medianas empresas' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
    },
  }));

  const videos = site.brands.flatMap((brand) => {
    const ytId = brand.youtubeId;
    if (!ytId) return [];
    return [
      {
        '@type': 'VideoObject',
        '@id': ID.video(brand.id),
        name: `${brand.name} — ${brand.tagline}`,
        description: brand.description,
        thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
        uploadDate: new Date().toISOString().slice(0, 10),
        contentUrl: `https://www.youtube.com/watch?v=${ytId}`,
        embedUrl: `https://www.youtube.com/embed/${ytId}`,
        publisher: { '@id': ID.org },
      },
    ];
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, person, ...services, ...videos],
  };
}
