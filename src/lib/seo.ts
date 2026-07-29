export const seoDefaults = {
  siteName: 'Cleverum',
  url: 'https://cleverum.org',
  locale: 'es_MX',
  title: 'Cleverum — Automatización con IA para empresas en México',
  description:
    'Automatización con IA, desarrollo web y chatbots de WhatsApp para PYMES. Con clientes en Monterrey, CDMX y LATAM. Diagnóstico gratis en ~1 minuto.',
  image: '/og.png',
  twitterHandle: '@cleverum',
  themeColor: '#08080B',
} as const;

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}

export function composeSeo(props: SeoProps = {}) {
  const title = props.title ? `${props.title} — ${seoDefaults.siteName}` : seoDefaults.title;
  const description = props.description ?? seoDefaults.description;
  const image = new URL(props.image ?? seoDefaults.image, seoDefaults.url).toString();
  const canonical = new URL(props.canonical ?? '/', seoDefaults.url).toString();
  return { title, description, image, canonical, noindex: props.noindex ?? false };
}
