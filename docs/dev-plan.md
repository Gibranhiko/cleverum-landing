# Dev Plan — Cleverum Landing

Plan de implementación ticket por ticket. Cada ticket es ejecutable de forma aislada y tiene criterios de aceptación verificables. Seguir el orden de epics.

> **Antes de tocar código**, leer [../CLAUDE.md](../CLAUDE.md). Define filosofía, stack, reglas de islas, tokens, performance budgets y SEO requirements.

## Índice

- [EPIC 1 — Foundations](#epic-1--foundations)
  - [T1 Bootstrap del proyecto Astro](#t1-bootstrap-del-proyecto-astro)
  - [T2 Fonts y design tokens](#t2-fonts-y-design-tokens)
  - [T3 BaseLayout con SEO completo](#t3-baselayout-con-seo-completo)
  - [T4 Sistema de contenido `site.ts`](#t4-sistema-de-contenido-sitets)
  - [T5 Configuración Cloudflare Pages](#t5-configuración-cloudflare-pages)
- [EPIC 2 — Sistema visual / 3D](#epic-2--sistema-visual--3d)
  - [T6 ScrollProgress provider e isla de progreso](#t6-scrollprogress-provider-e-isla-de-progreso)
  - [T7 ParticleField — canvas R3F base](#t7-particlefield--canvas-r3f-base)
  - [T8 Shader de partículas con `uProgress`](#t8-shader-de-partículas-con-uprogress)
  - [T9 Conectar ScrollTrigger scrub → uniforms](#t9-conectar-scrolltrigger-scrub--uniforms)
  - [T10 Fallback reduced-motion y mobile](#t10-fallback-reduced-motion-y-mobile)
- [EPIC 3 — Secciones](#epic-3--secciones)
  - [T11 Hero](#t11-hero)
  - [T12 Manifesto](#t12-manifesto)
  - [T13 BrandsStack (sticky stack)](#t13-brandsstack-sticky-stack)
  - [T14 YouTubeLite](#t14-youtubelite)
  - [T15 HowWeWork](#t15-howwework)
  - [T16 BentoDifferentiators](#t16-bentodifferentiators)
  - [T17 CapabilitiesMarquee](#t17-capabilitiesmarquee)
  - [T18 ContactCTA](#t18-contactcta)
  - [T19 Footer](#t19-footer)
- [EPIC 4 — SEO / Performance / Pulido / Deploy](#epic-4--seo--performance--pulido--deploy)
  - [T20 OG image y favicons](#t20-og-image-y-favicons)
  - [T21 Structured data JSON-LD](#t21-structured-data-json-ld)
  - [T22 Responsive review](#t22-responsive-review)
  - [T23 Lighthouse pass](#t23-lighthouse-pass)
  - [T24 Deploy a Cloudflare Pages](#t24-deploy-a-cloudflare-pages)

---

## EPIC 1 — Foundations

### T1 Bootstrap del proyecto Astro

**Objetivo**: Iniciar el proyecto Astro 5 con TypeScript, Tailwind v4, e integraciones esenciales.

**Dependencias**: ninguna.

**Archivos a crear/modificar**:

- `package.json`
- `astro.config.mjs`
- `tsconfig.json`
- `tailwind.config.ts`
- `.gitignore`
- `.editorconfig`
- `.prettierrc`
- `eslint.config.js`
- `src/pages/index.astro` (placeholder)

**Pasos**:

1. Inicializar con `npm create astro@latest .` eligiendo: minimal, TypeScript strict, install deps, no git (ya inicializado).
2. Instalar integraciones:
   ```bash
   npm install @astrojs/react @astrojs/sitemap @astrojs/check
   npm install tailwindcss @tailwindcss/vite
   npm install react react-dom @types/react @types/react-dom
   ```
3. Configurar `astro.config.mjs` con:
   - `output: 'static'`
   - `site: 'https://cleverum.org'`
   - integrations: `react()`, `sitemap()`
   - vite: `tailwindcss()` plugin
   - `prefetch: { prefetchAll: true }`
4. `tsconfig.json` con `"extends": "astro/tsconfigs/strict"`.
5. `.prettierrc` con `plugin: prettier-plugin-astro`.
6. `eslint.config.js` con reglas para `.astro`, `.tsx`.
7. Verificar `npm run dev` y `npm run build` funcionan en placeholder.

**Criterios de aceptación**:

- [ ] `npm install` corre sin errores
- [ ] `npm run dev` levanta servidor sin warnings
- [ ] `npm run build` produce `dist/` con `index.html`
- [ ] `npm run astro check` pasa
- [ ] `.gitignore` incluye `node_modules`, `dist`, `.astro`, `.env*`

**Notas técnicas**:

- Tailwind v4 usa el plugin de Vite, **no** PostCSS. Es plug-and-play más rápido.
- Mantener Node ≥ 20.

---

### T2 Fonts y design tokens

**Objetivo**: Configurar tipografía y exponer todos los design tokens como CSS variables consumibles por Tailwind v4.

**Dependencias**: T1.

**Archivos a crear/modificar**:

- `src/styles/global.css`
- `src/styles/fluid.css`
- `astro.config.mjs` (añadir `experimental.fonts` o usar self-hosted)
- `public/fonts/` (si self-hosted)

**Pasos**:

1. Configurar `astro:fonts` (experimental en Astro 5.7+) o instalar `@fontsource-variable/inter` y `@fontsource-variable/geist`. Preferir self-hosted para LCP.
2. En `src/styles/global.css` declarar `@import "tailwindcss";` y bajo `@theme` mapear tokens:

   ```css
   @theme {
     --color-bg-base: #08080b;
     --color-bg-elev: #111114;
     --color-brand-blue: #4f8af7;
     --color-brand-iris: #7c5cff;
     --color-brand-grape: #a855f7;
     --color-accent-go: #22c55e;
     --color-text-1: #ffffff;
     --color-text-2: #b4b4bf;
     --color-border: rgba(255, 255, 255, 0.08);

     --font-display: 'Geist Variable', system-ui, sans-serif;
     --font-body: 'Inter Variable', system-ui, sans-serif;

     --radius-card: 1.5rem;
     --radius-pill: 9999px;
   }
   ```

3. En `fluid.css` definir `clamp()` para escalas tipográficas:
   ```css
   :root {
     --fs-hero: clamp(2.75rem, 8vw, 9rem);
     --fs-h2: clamp(2rem, 5vw, 4.5rem);
     --fs-h3: clamp(1.5rem, 3vw, 2.5rem);
     --fs-body: clamp(1rem, 1.2vw, 1.125rem);
     --fs-lead: clamp(1.125rem, 1.6vw, 1.375rem);
   }
   ```
4. Definir clases utilitarias custom: `.glass-card`, `.gradient-text`, `.section-pad`.
5. Aplicar `font-family: var(--font-body)` al `<body>` y `background: var(--color-bg-base)`.

**Criterios de aceptación**:

- [ ] Tokens accesibles vía clases Tailwind (`bg-bg-base`, `text-brand-iris`, etc.)
- [ ] Fuentes cargan con `font-display: swap` y subset latino
- [ ] No hay FOIT/FOUT visible al recargar
- [ ] Lighthouse no marca fuentes como render-blocking

**Notas técnicas**:

- Tailwind v4 lee tokens directamente del `@theme` — no requiere `tailwind.config.ts` para colores básicos.
- Preload de la fuente display en `<head>`.

---

### T3 BaseLayout con SEO completo

**Objetivo**: Layout raíz con todo el SEO esencial, view transitions, y structured data básico.

**Dependencias**: T2.

**Archivos a crear/modificar**:

- `src/layouts/BaseLayout.astro`
- `src/lib/seo.ts`

**Pasos**:

1. Crear `BaseLayout.astro` con props: `title`, `description`, `image?`, `canonical?`.
2. Incluir en `<head>`:
   - `<meta charset>`, `<meta viewport>`
   - `<title>` y `<meta name="description">`
   - Open Graph: `og:type`, `og:title`, `og:description`, `og:image`, `og:url`, `og:locale="es_MX"`
   - Twitter: `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`
   - `<link rel="canonical">`
   - Favicons (placeholder por ahora, se completa en T20)
   - `<meta name="theme-color" content="#08080B">`
   - Preload de fuente display
   - `<link rel="manifest">` (se crea en T20)
3. Importar `<ClientRouter />` de `astro:transitions` para view transitions.
4. Body con slot, importar `global.css` y `fluid.css`.
5. `src/lib/seo.ts` exporta defaults y helpers para componer metadatos por sección.

**Criterios de aceptación**:

- [ ] `<html lang="es">` correcto
- [ ] Open Graph completo en build (`view-source:` muestra todos los meta)
- [ ] View transitions activas (transición suave al recargar)
- [ ] Validar OG con [opengraph.xyz](https://www.opengraph.xyz/) tras T20

**Notas técnicas**:

- Astro inyecta `<ClientRouter />` que es ligero (~3KB) — vale la pena para la sensación premium.

---

### T4 Sistema de contenido `site.ts`

**Objetivo**: Centralizar toda la copy, datos de contacto, IDs de YouTube y configuración editable en un único módulo tipado.

**Dependencias**: T1.

**Archivos a crear/modificar**:

- `src/content/site.ts`
- `src/lib/whatsapp.ts`

**Pasos**:

1. Crear `site.ts` con shape tipado:

```ts
export const site = {
  meta: {
    title: 'Cleverum — Automatización e innovación para tu negocio',
    description:
      'Soluciones inteligentes para negocios que evolucionan. Desarrollo web, IA y chatbots de WhatsApp.',
    url: 'https://cleverum.org',
    locale: 'es_MX',
  },
  contact: {
    name: 'Gibran Villarreal',
    email: 'gibran.villarreal@cleverum.com',
    phone: '+52 55 4143 3545',
    whatsapp: {
      number: '5215541433545',
      prefilledMessage: '¡Hola! Vi tu landing y quiero saber más sobre cómo pueden ayudarme.',
    },
  },
  hero: {
    eyebrow: 'AUTOMATIZACIÓN E INNOVACIÓN',
    title: ['Soluciones inteligentes', 'para negocios que', 'evolucionan'],
    subtitle:
      'Tres marcas, una visión: tecnología que conecta, automatiza y transforma tu negocio.',
    ctaLabel: 'Hablemos por WhatsApp',
  },
  manifesto: {
    words: ['Tecnología', 'que', 'conecta,', 'automatiza', 'y', 'transforma', 'tu', 'negocio.'],
    accent: { connects: ['conecta,'], blue: ['automatiza'], green: ['transforma'] },
  },
  brands: [
    {
      id: 'devindry',
      name: 'Devindry',
      tagline: 'Desarrollo web y mobile',
      description:
        'Páginas, e-commerce y apps que convierten. Diseño moderno, performance impecable y campañas que escalan.',
      accent: 'blue',
      youtubeId: null,
      videoPlaceholder: 'Próximamente: demo de un caso de desarrollo mobile',
      bullets: [
        'Páginas web y e-commerce optimizados',
        'Apps móviles iOS y Android',
        'Campañas Google Ads y redes sociales',
      ],
    },
    {
      id: 'cleverum',
      name: 'Cleverum',
      tagline: 'Automatización con IA para negocios',
      description:
        'Diagnosticamos procesos, los automatizamos con IA y conectamos tus herramientas. Menos burocracia, más resultados.',
      accent: 'iris',
      youtubeId: null,
      videoPlaceholder: 'Próximamente: caso real de automatización',
      bullets: [
        'Automatización de procesos end-to-end',
        'Integración de IA avanzada',
        'Análisis y reportes en tiempo real',
      ],
    },
    {
      id: 'wabbi',
      name: 'Wabbi',
      tagline: 'Chatbots inteligentes para WhatsApp',
      description:
        'Atención 24/7, segmentación y conversiones reales. Tu canal de mayor engagement, ahora automático.',
      accent: 'green',
      youtubeId: null,
      videoPlaceholder: 'Próximamente: demo de chatbot WhatsApp',
      bullets: [
        'Atención automática 24/7',
        'Respuestas inteligentes con IA',
        'Segmentación y campañas personalizadas',
      ],
    },
  ],
  howWeWork: [
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
    { step: '04', title: 'Resultados', body: 'Medimos, iteramos y escalamos lo que funciona.' },
  ],
  differentiators: [
    { title: 'Soluciones a la medida', body: 'Cada cliente, cada flujo. Nada de plantillas.' },
    {
      title: 'Tecnología de vanguardia',
      body: 'IA, automatización y WebGL — lo que hay de bueno, lo usamos.',
    },
    { title: '100% enfocados en resultados', body: 'KPIs claros, ROI medible, deadlines reales.' },
    { title: 'Innovación sin límites', body: 'Si no existe la herramienta, la construimos.' },
  ],
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
  ],
  footer: {
    rights: '© 2026 Cleverum. Todos los derechos reservados.',
    socials: [],
  },
} as const;

export type Site = typeof site;
export type Brand = (typeof site.brands)[number];
```

2. Crear `lib/whatsapp.ts`:

```ts
import { site } from '../content/site';

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? site.contact.whatsapp.prefilledMessage);
  return `https://wa.me/${site.contact.whatsapp.number}?text=${text}`;
}
```

**Criterios de aceptación**:

- [ ] `site.ts` tipa todo como `as const` y exporta tipos
- [ ] `whatsappLink()` genera URL válida con encoding correcto
- [ ] Ningún componente futuro hardcodea texto que ya esté en `site.ts`

**Notas técnicas**:

- El número WhatsApp `5215541433545` es formato wa.me: `52` (México) + `1` (móvil) + 10 dígitos.

---

### T5 Configuración Cloudflare Pages

**Objetivo**: Dejar listo el repo para deploy en Cloudflare Pages con preview branches y dominio personalizado.

**Dependencias**: T1.

**Archivos a crear/modificar**:

- `wrangler.toml` (opcional, solo si se quiere CLI deploy)
- `public/_headers`
- `public/_redirects`
- `package.json` (scripts)

**Pasos**:

1. Crear `public/_headers` con cache headers correctos:

   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: camera=(), microphone=(), geolocation=()

   /assets/*
     Cache-Control: public, max-age=31536000, immutable

   /fonts/*
     Cache-Control: public, max-age=31536000, immutable
   ```

2. Crear `public/_redirects` vacío inicialmente.
3. Documentar en README rápido los pasos manuales en dashboard CF Pages:
   - Conectar repo
   - Build command: `npm run build`
   - Output dir: `dist`
   - Node version: `20`
   - Variables: ninguna por ahora
   - Custom domain: `cleverum.org`

**Criterios de aceptación**:

- [ ] `public/_headers` presente con security headers
- [ ] Build local (`npm run build`) produce `dist/` deployable
- [ ] El primer push a `main` se puede vincular a CF Pages sin cambios extra

**Notas técnicas**:

- No usar adapter `@astrojs/cloudflare` — es para SSR. Para SSG basta `output: 'static'`.

---

## EPIC 2 — Sistema visual / 3D

### T6 ScrollProgress provider e isla de progreso

**Objetivo**: Exponer scroll progress global (0–1) como contexto consumible por todas las islas. Renderizar barra superior animada.

**Dependencias**: T2.

**Archivos a crear/modificar**:

- `src/components/react/ScrollProgressProvider.tsx`
- `src/components/react/ScrollProgressBar.tsx`
- `src/components/react/useScrollProgress.ts`

**Pasos**:

1. `ScrollProgressProvider.tsx` (Context):
   - State `progress: number`
   - `useEffect` con listener `scroll` (passive) que calcula `scrollY / (docHeight - winHeight)`
   - `requestAnimationFrame` throttle
   - Provee `progress` por Context
2. `useScrollProgress.ts` — hook consumidor del context.
3. `ScrollProgressBar.tsx`:
   - Consume `useScrollProgress`
   - Renderiza `<div fixed top-0 h-[2px] w-full>` con `<div style={{ width: progress*100 + '%' }} class="bg-gradient-to-r from-brand-blue via-brand-iris to-brand-grape">`
4. En `BaseLayout.astro`, montar `<ScrollProgressProvider client:idle>` envolviendo el slot, y `<ScrollProgressBar client:idle>`.

**Criterios de aceptación**:

- [ ] Barra se llena suavemente al hacer scroll
- [ ] No causa CLS al cargar
- [ ] No re-renderiza más de 60 veces/s (throttle con rAF)
- [ ] Funciona con view transitions (re-suscribe al cambiar de page si hubiera)

**Notas técnicas**:

- Como Astro hidrata islas independientemente, el Provider y Bar deben compartir el mismo árbol React. Solución: que Provider wrappee TODA la página y Bar viva dentro.
- Alternativa más simple si no se logra: que Bar tenga su propio listener (duplicar es OK aquí, es cheap).

---

### T7 ParticleField — canvas R3F base

**Objetivo**: Montar canvas R3F fixed detrás del contenido con geometría de partículas en posiciones iniciales (nube esférica).

**Dependencias**: T6.

**Archivos a crear/modificar**:

- `src/components/react/ParticleField.tsx`
- `src/components/three/particleGeometry.ts`

**Pasos**:

1. Instalar:
   ```bash
   npm install three @react-three/fiber @react-three/drei
   npm install -D @types/three
   ```
2. `particleGeometry.ts` exporta función `createParticleAttributes(count: number)` que devuelve:
   - `positions: Float32Array` — distribución Fibonacci sphere
   - `seedPositions: Float32Array` — guarda misma posición para luego interpolar
   - `targetPositions: Float32Array` — target a llenar después (T8)
3. `ParticleField.tsx`:
   - `<Canvas>` con `dpr={[1, 2]}`, `gl={{ antialias: false, alpha: true }}`, `camera={{ position: [0,0,8], fov: 50 }}`
   - `<points>` con `bufferGeometry` y `pointsMaterial` con `color`, `size`, `sizeAttenuation`, `transparent`, `opacity: 0.8`, `blending: AdditiveBlending`
   - Wrapper div: `fixed inset-0 -z-10 pointer-events-none`
4. Montar en `BaseLayout` con `client:visible`.

**Criterios de aceptación**:

- [ ] Canvas se monta solo cuando entra en viewport (no en SSR)
- [ ] 60fps en MacBook Air M1 con 8000 partículas
- [ ] No hay overflow del canvas hacia el contenido (z-index correcto)
- [ ] `pointer-events: none` deja pasar clicks al contenido

**Notas técnicas**:

- `client:visible` evita penalizar LCP del hero.
- Si la fuente del hero pinta más rápido y el canvas aparece después, está OK — incluso es deseable como reveal.

---

### T8 Shader de partículas con `uProgress`

**Objetivo**: Reemplazar el `pointsMaterial` por `shaderMaterial` custom que interpole entre estados (nube → red → constelación) en función de `uProgress`.

**Dependencias**: T7.

**Archivos a crear/modificar**:

- `src/components/three/shaders/particles.vert.glsl`
- `src/components/three/shaders/particles.frag.glsl`
- `src/components/react/ParticleField.tsx` (refactor)
- `src/components/three/particleGeometry.ts` (extender)

**Pasos**:

1. Extender `particleGeometry.ts` para generar **dos buffers extra de target**:
   - `targetA`: red 3D ordenada (grid o nodes de grafo)
   - `targetB`: constelación final (más dispersa, con clusters)
2. Vertex shader (`particles.vert.glsl`):

   ```glsl
   uniform float uProgress;
   uniform float uTime;
   attribute vec3 aTargetA;
   attribute vec3 aTargetB;
   varying float vAlpha;

   void main() {
     vec3 pos;
     if (uProgress < 0.5) {
       pos = mix(position, aTargetA, smoothstep(0.0, 0.5, uProgress));
     } else {
       pos = mix(aTargetA, aTargetB, smoothstep(0.5, 1.0, uProgress));
     }
     // ligero swirl con uTime
     float wobble = sin(uTime * 0.3 + pos.y * 2.0) * 0.05;
     pos.x += wobble;

     vec4 mv = modelViewMatrix * vec4(pos, 1.0);
     gl_Position = projectionMatrix * mv;
     gl_PointSize = (8.0 / -mv.z) * (1.0 + uProgress * 0.5);
     vAlpha = 0.7 + uProgress * 0.3;
   }
   ```

3. Fragment shader (`particles.frag.glsl`):

   ```glsl
   uniform vec3 uColorA;
   uniform vec3 uColorB;
   uniform float uProgress;
   varying float vAlpha;

   void main() {
     vec2 c = gl_PointCoord - 0.5;
     float d = length(c);
     if (d > 0.5) discard;
     float a = smoothstep(0.5, 0.0, d) * vAlpha;
     vec3 color = mix(uColorA, uColorB, uProgress);
     gl_FragColor = vec4(color, a);
   }
   ```

4. En `ParticleField.tsx`, usar `shaderMaterial` (drei) o `THREE.ShaderMaterial` con uniforms:
   - `uProgress: { value: 0 }`
   - `uTime: { value: 0 }`
   - `uColorA: new Color('#4F8AF7')`
   - `uColorB: new Color('#7C5CFF')`
5. En `useFrame`, incrementar `uTime`. `uProgress` se actualizará en T9.

**Criterios de aceptación**:

- [ ] Al cambiar manualmente `uProgress` (devtools), las partículas se reorganizan suavemente
- [ ] El color transiciona blue → iris → grape
- [ ] No hay parpadeos / artefactos
- [ ] Compila sin warnings de shader

**Notas técnicas**:

- Usar `glsl` template literals importados con vite plugin `vite-plugin-glsl` si se prefiere, o pegar strings inline.

---

### T9 Conectar ScrollTrigger scrub → uniforms

**Objetivo**: Que el scroll de la página controle `uProgress` con `scrub: true` (suavizado) sin tearing.

**Dependencias**: T6, T8.

**Archivos a crear/modificar**:

- `src/components/react/ParticleField.tsx`

**Pasos**:

1. Dentro de `ParticleField`, leer `useScrollProgress()` del provider.
2. Mantener un `uProgressRef` y en `useFrame` hacer `lerp` suave:
   ```ts
   useFrame((_, dt) => {
     const target = scrollProgress;
     uProgressRef.current += (target - uProgressRef.current) * Math.min(1, dt * 5);
     material.uniforms.uProgress.value = uProgressRef.current;
     material.uniforms.uTime.value += dt;
   });
   ```
3. Alternativa con GSAP ScrollTrigger directo (si el provider no alcanza):
   - Registrar plugin
   - `ScrollTrigger.create({ start: 0, end: 'max', scrub: 0.8, onUpdate: ({ progress }) => uniforms.uProgress.value = progress })`

**Criterios de aceptación**:

- [ ] Al hacer scroll, las partículas pasan de nube → red → constelación
- [ ] La interpolación es suave (no salta)
- [ ] No drops de FPS al hacer scroll rápido
- [ ] Funciona al recargar a mitad de página (estado inicial coherente)

**Notas técnicas**:

- `dt * 5` da una respuesta crítica ~0.2s; ajustar al gusto.

---

### T10 Fallback reduced-motion y mobile

**Objetivo**: Respetar `prefers-reduced-motion` y no cargar 3D en mobile (< 768px).

**Dependencias**: T7.

**Archivos a crear/modificar**:

- `src/components/react/ParticleField.tsx`
- `src/components/ui/GradientMeshBackground.astro`
- `src/layouts/BaseLayout.astro`

**Pasos**:

1. En `BaseLayout`, condicionar la isla:
   ```astro
   <ParticleField client:media="(min-width: 768px) and (prefers-reduced-motion: no-preference)" />
   <GradientMeshBackground />
   ```
2. `GradientMeshBackground.astro` — un fondo CSS estático con gradient mesh (mezcla radial-gradients) y opcionalmente noise SVG. Posicionado `fixed inset-0 -z-20`.
3. Dentro de `ParticleField`, además, escuchar `matchMedia('(prefers-reduced-motion: reduce)')` y si cambia → desuscribir scroll → uniform y dejar partículas en estado estático (`uProgress = 0`).

**Criterios de aceptación**:

- [ ] En iPhone (Safari) no se monta Canvas
- [ ] Con DevTools forzando `prefers-reduced-motion: reduce`, no se monta Canvas
- [ ] El fondo CSS gradient mesh queda visualmente atractivo como fallback
- [ ] No FOUC entre fondo y canvas

**Notas técnicas**:

- `client:media` evalúa en el cliente; si no matchea, la isla nunca se hidrata → cero costo.

---

## EPIC 3 — Secciones

> Para todas las secciones: usar `<BaseLayout>` desde `index.astro`, importar componentes de `src/components/sections/`. Toda la copy proviene de `site.ts`.

### T11 Hero

**Objetivo**: Sección hero typography-led con eyebrow, título, subtítulo, CTA WhatsApp y chevron.

**Dependencias**: T4, T7.

**Archivos a crear/modificar**:

- `src/components/sections/Hero.astro`
- `src/components/ui/WhatsAppButton.astro`
- `src/components/ui/Chevron.astro`

**Pasos**:

1. `Hero.astro`:
   - `<section id="hero" class="relative min-h-screen flex flex-col justify-center px-6 md:px-12">`
   - Eyebrow chip pequeño con `site.hero.eyebrow`
   - Título: cada línea de `site.hero.title` en un `<span>` con `display: block` y `font-display`, tamaño `var(--fs-hero)`, tracking-tight, last word con `gradient-text`
   - Subtítulo con `var(--fs-lead)`
   - `<WhatsAppButton variant="primary" />`
   - Chevron animado abajo, `position: absolute bottom-12`
2. `WhatsAppButton.astro` — pill glass con icono, lee `site.contact.whatsapp` y `lib/whatsapp.ts`.
3. `Chevron.astro` — SVG con CSS animation bounce, respeta `prefers-reduced-motion`.

**Criterios de aceptación**:

- [ ] El hero ocupa 100vh sin scroll forzado
- [ ] El título es legible sobre el campo de partículas (sombra sutil o backdrop si hace falta)
- [ ] CTA es focusable y tiene `aria-label` descriptivo
- [ ] Chevron al click hace `scrollIntoView` a la siguiente sección

**Notas técnicas**:

- El gradient-text del título debe respetar contraste; si en algún viewport queda ilegible, subir opacidad.

---

### T12 Manifesto

**Objetivo**: Manifiesto con reveal palabra-por-palabra usando CSS scroll-driven animations (sin JS).

**Dependencias**: T11.

**Archivos a crear/modificar**:

- `src/components/sections/Manifesto.astro`
- `src/styles/manifesto.css`

**Pasos**:

1. `Manifesto.astro`:
   - `<section class="manifesto">`
   - Itera `site.manifesto.words`, cada uno en `<span class="manifesto-word">{word}</span>` con clase de color condicional según `site.manifesto.accent`.
2. `manifesto.css`:
   ```css
   @supports (animation-timeline: view()) {
     .manifesto-word {
       opacity: 0.15;
       font-weight: 300;
       animation: word-reveal linear both;
       animation-timeline: view();
       animation-range: entry 30% cover 50%;
     }
     @keyframes word-reveal {
       to {
         opacity: 1;
         font-weight: 700;
       }
     }
   }
   @supports not (animation-timeline: view()) {
     .manifesto-word {
       opacity: 1;
     }
   }
   ```
3. Asegurar reduced-motion: dentro de `@media (prefers-reduced-motion: reduce)`, `opacity: 1; animation: none;`.

**Criterios de aceptación**:

- [ ] Cada palabra se ilumina y se hace bold al entrar al viewport
- [ ] En navegadores sin soporte, se ven todas las palabras claras
- [ ] Cero JS para esta sección
- [ ] La animación es suave y cinematográfica

**Notas técnicas**:

- `animation-timeline` ya está en Chrome/Edge estable y Firefox 142+. Safari aún no — el fallback es aceptable.

---

### T13 BrandsStack (sticky stack)

**Objetivo**: Tres cards de marca apiladas que se quedan stickys al hacer scroll, una encima de la otra. Cada card tiene: nombre, tagline, video YouTube, 3 bullets, CTA.

**Dependencias**: T4, T14.

**Archivos a crear/modificar**:

- `src/components/sections/BrandsStack.astro`
- `src/components/ui/BrandCard.astro`

**Pasos**:

1. `BrandsStack.astro`:
   - `<section id="brands" class="brands-stack">`
   - Itera `site.brands` y para cada marca:
     ```astro
     <article
       class="brand-card"
       style={`--accent: var(--color-brand-${brand.accent}); top: ${10 + i * 4}vh; z-index: ${i + 1};`}
     >
       <BrandCard brand={brand} index={i} />
     </article>
     ```
2. CSS:
   ```css
   .brands-stack {
     padding: 8vh 0;
   }
   .brand-card {
     position: sticky;
     min-height: 80vh;
     margin-inline: auto;
     max-width: 1100px;
     padding: 4rem;
     border-radius: var(--radius-card);
     background: linear-gradient(
       180deg,
       color-mix(in srgb, var(--accent) 8%, var(--color-bg-elev)),
       var(--color-bg-elev)
     );
     border: 1px solid var(--color-border);
     box-shadow: 0 30px 80px -30px color-mix(in srgb, var(--accent) 40%, transparent);
   }
   ```
3. `BrandCard.astro`:
   - Grid 2 columnas (md+): izquierda texto, derecha video YouTube
   - Eyebrow con número 01/02/03 y nombre marca
   - Título tagline
   - Descripción
   - Lista de 3 bullets con dot del accent
   - CTA WhatsApp con `prefilledMessage` específico (`'Quiero saber más sobre {{brand.name}}'`)
4. Cada card debe tener una altura tal que se vea la siguiente "asomar" antes de que ésta deje de ser sticky → no cap rígido, dejar que `min-height: 80vh` y siguiente se monte arriba.

**Criterios de aceptación**:

- [ ] Las 3 cards se apilan visualmente al hacer scroll (la nueva cubre la anterior)
- [ ] Cada card respira en mobile (stack vertical natural)
- [ ] El acento de color de cada marca es claramente distinto
- [ ] El video YouTube se ve correctamente integrado, sin overflow

**Notas técnicas**:

- El truco del stack sticky es que cada `<article>` sea `position: sticky` con `top` incrementando ligeramente para que se vea el "borde" de las anteriores debajo.
- En mobile (< 768px), apagar el sticky para que sea scroll normal.

---

### T14 YouTubeLite

**Objetivo**: Componente reutilizable para embed lazy de YouTube. Muestra placeholder si `youtubeId` es null.

**Dependencias**: T1.

**Archivos a crear/modificar**:

- `src/components/ui/YouTubeLite.astro`

**Pasos**:

1. Instalar:
   ```bash
   npm install @astro-community/astro-embed-youtube
   ```
2. `YouTubeLite.astro`:

   ```astro
   ---
   import { YouTube } from '@astro-community/astro-embed-youtube';
   const { id, title, placeholderText } = Astro.props;
   ---

   {
     id ? (
       <YouTube id={id} title={title} class="overflow-hidden rounded-2xl" />
     ) : (
       <div class="border-border bg-bg-elev flex aspect-video items-center justify-center rounded-2xl border p-8">
         <div class="text-center">
           <div class="text-text-2 mb-2 text-sm tracking-widest uppercase">Próximamente</div>
           <div class="text-text-1 text-lg">{placeholderText}</div>
         </div>
       </div>
     )
   }
   ```

**Criterios de aceptación**:

- [ ] Con `id={null}` muestra placeholder estilizado
- [ ] Con id real muestra preview thumbnail y solo carga iframe al click
- [ ] Cero JS extra cuando es placeholder
- [ ] Mantiene aspect ratio 16:9 sin CLS

**Notas técnicas**:

- `@astro-community/astro-embed-youtube` usa `lite-youtube` web component — ~3KB.

---

### T15 HowWeWork

**Objetivo**: Sección "Cómo trabajamos" con 4 pasos en grid horizontal y una línea de progreso scroll-driven que se llena al hacer scroll.

**Dependencias**: T4.

**Archivos a crear/modificar**:

- `src/components/sections/HowWeWork.astro`

**Pasos**:

1. `HowWeWork.astro`:
   - Heading "Cómo trabajamos"
   - `<ol>` con 4 `<li>` (uno por `site.howWeWork`), grid `md:grid-cols-4`
   - Cada paso: número grande, título, body corto
   - Línea horizontal absoluta detrás con `animation-timeline: view()` que se llena de 0→100%
2. CSS:
   ```css
   .progress-line::after {
     content: '';
     position: absolute;
     inset: 0;
     background: linear-gradient(
       90deg,
       var(--color-brand-blue),
       var(--color-brand-iris),
       var(--color-accent-go)
     );
     transform-origin: left;
     transform: scaleX(0);
     animation: fill-line linear both;
     animation-timeline: view();
   }
   @keyframes fill-line {
     to {
       transform: scaleX(1);
     }
   }
   ```

**Criterios de aceptación**:

- [ ] En desktop: 4 pasos horizontales con línea progresando
- [ ] En mobile: stack vertical, línea vertical o ausente
- [ ] Sin JS

---

### T16 BentoDifferentiators

**Objetivo**: Grid asimétrico tipo "bento" con los 4 diferenciadores + 2 cuadros visuales (estadística destacada / cita).

**Dependencias**: T4.

**Archivos a crear/modificar**:

- `src/components/sections/BentoDifferentiators.astro`

**Pasos**:

1. Grid CSS:
   ```css
   .bento {
     display: grid;
     gap: 1rem;
     grid-template-columns: repeat(6, 1fr);
     grid-auto-rows: minmax(180px, auto);
   }
   .bento > :nth-child(1) {
     grid-column: span 3;
     grid-row: span 2;
   }
   .bento > :nth-child(2) {
     grid-column: span 3;
   }
   .bento > :nth-child(3) {
     grid-column: span 2;
   }
   .bento > :nth-child(4) {
     grid-column: span 4;
   }
   .bento > :nth-child(5) {
     grid-column: span 4;
     grid-row: span 2;
   }
   .bento > :nth-child(6) {
     grid-column: span 2;
   }
   ```
2. Contenido:
   - Cuadros 1, 2, 4, 6: los 4 `site.differentiators`
   - Cuadro 3: estadística grande (ej. "100%" enfocados en resultados)
   - Cuadro 5: cita o frase destacada del manifiesto
3. En mobile, columnas 1 sola y `grid-row: auto` para todos.

**Criterios de aceptación**:

- [ ] Layout asimétrico atractivo desktop
- [ ] Layout cuadros apilados mobile sin overflow
- [ ] Cada cuadro tiene microhover (translate-y -2px + glow)

---

### T17 CapabilitiesMarquee

**Objetivo**: Tira infinita de tags de capacidades scrolleando horizontalmente, en loop, CSS-only.

**Dependencias**: T4.

**Archivos a crear/modificar**:

- `src/components/sections/CapabilitiesMarquee.astro`

**Pasos**:

1. Duplicar el array `site.capabilities` y renderizar 2 copias seguidas dentro de un track de `width: max-content`.
2. CSS:
   ```css
   .marquee {
     overflow: hidden;
     mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
   }
   .marquee-track {
     display: flex;
     gap: 1rem;
     width: max-content;
     animation: marquee 40s linear infinite;
   }
   @keyframes marquee {
     to {
       transform: translateX(-50%);
     }
   }
   .marquee-track:hover {
     animation-play-state: paused;
   }
   @media (prefers-reduced-motion: reduce) {
     .marquee-track {
       animation: none;
     }
   }
   ```
3. Cada tag: pill con borde sutil, texto `text-2`.

**Criterios de aceptación**:

- [ ] Loop continuo sin saltos
- [ ] Pausa al hover
- [ ] Sin scrollbar horizontal
- [ ] Sin JS

---

### T18 ContactCTA

**Objetivo**: Sección final con CTA grande de WhatsApp, datos de contacto y opcionalmente QR.

**Dependencias**: T4.

**Archivos a crear/modificar**:

- `src/components/sections/ContactCTA.astro`

**Pasos**:

1. Heading XL: "¿Listo para automatizar tu negocio?"
2. Subtítulo corto
3. CTA grande WhatsApp (variante "primary" más grande)
4. Tarjeta inferior con: nombre, teléfono, email del `site.contact`
5. Opcional: QR generado al build con `qrcode` package apuntando al `whatsappLink()`

**Criterios de aceptación**:

- [ ] CTA es lo primero visible al entrar a la sección
- [ ] Datos copiables (selectable text)
- [ ] Email es `mailto:` y teléfono `tel:`

---

### T19 Footer

**Objetivo**: Footer minimal con las 3 marcas, copyright y enlaces.

**Dependencias**: T4.

**Archivos a crear/modificar**:

- `src/components/sections/Footer.astro`

**Pasos**:

1. Grid 3 columnas: una por marca con su nombre y tagline
2. Línea separadora
3. `© 2026 Cleverum...` + redes (si las hay en `site.footer.socials`)

**Criterios de aceptación**:

- [ ] Footer es semantic `<footer role="contentinfo">`
- [ ] Año generado dinámicamente: `new Date().getFullYear()`

---

## EPIC 4 — SEO / Performance / Pulido / Deploy

### T20 OG image y favicons

**Objetivo**: Generar OG image dinámica al build + suite completa de favicons.

**Dependencias**: T3.

**Archivos a crear/modificar**:

- `src/pages/og.png.ts`
- `public/favicons/*` (8 sizes + apple-touch-icon)
- `public/site.webmanifest`

**Pasos**:

1. OG image: usar `@vercel/og` o `satori` para componer una imagen 1200×630 con el título del hero, branding y un gradient mesh. Endpoint `src/pages/og.png.ts` que se ejecuta al build.
2. Favicons: generar desde un SVG master con [realfavicongenerator.net](https://realfavicongenerator.net/) o `sharp` localmente. Output a `public/favicons/`.
3. `site.webmanifest` con `name`, `short_name`, `theme_color: #08080B`, icons.
4. Actualizar `BaseLayout.astro` con todos los `<link>` correctos.

**Criterios de aceptación**:

- [ ] Compartir el link en WhatsApp/Slack/Twitter muestra OG card correcta
- [ ] Lighthouse no marca falta de favicons
- [ ] PWA installable check pasa (no es PWA, pero el manifest válido ayuda en algunos browsers)

---

### T21 Structured data JSON-LD

**Objetivo**: Inyectar structured data correcto para máxima visibilidad SEO.

**Dependencias**: T3, T4.

**Archivos a crear/modificar**:

- `src/lib/jsonld.ts`
- `src/layouts/BaseLayout.astro`

**Pasos**:

1. `lib/jsonld.ts` exporta funciones que retornan objetos JSON-LD para:
   - `Organization` (Cleverum)
   - `Service` × 3 (Devindry, Cleverum, Wabbi)
   - `Person` (Gibran Villarreal)
   - `LocalBusiness` (datos MX)
   - `WebSite` con `SearchAction` placeholder
   - `VideoObject` × 3 (condicional: solo si `youtubeId` existe)
2. En `BaseLayout`, inyectar todos con `<script type="application/ld+json" set:html={JSON.stringify(...)}></script>`.

**Criterios de aceptación**:

- [ ] [Rich Results Test](https://search.google.com/test/rich-results) valida sin errores
- [ ] [Schema validator](https://validator.schema.org/) sin errores
- [ ] Cuando se agrega un `youtubeId`, el `VideoObject` correspondiente aparece automáticamente

---

### T22 Responsive review

**Objetivo**: Garantizar que la landing se ve impecable en 5 breakpoints clave.

**Dependencias**: T11–T19.

**Archivos a crear/modificar**: ajustes puntuales según hallazgos.

**Pasos**:

1. Probar en 375 (iPhone SE), 768 (iPad), 1024 (laptop), 1440 (desktop), 1920 (large desktop).
2. Reglas clave a verificar:
   - Hero: título no rompe palabras feo
   - BrandsStack: el sticky funciona en md+, scroll normal en mobile
   - Bento: no genera scrollbar horizontal
   - Marquee: no salta
   - Particulas: no en mobile
3. Documentar cualquier breakpoint custom necesario en `tailwind.config.ts`.

**Criterios de aceptación**:

- [ ] Cero scroll horizontal en ningún viewport
- [ ] Tap targets ≥ 44×44px en mobile
- [ ] Texto no se trunca

---

### T23 Lighthouse pass

**Objetivo**: 95+ Performance / 100 SEO / 100 A11y / 100 Best Practices.

**Dependencias**: T20–T22.

**Pasos**:

1. `npm run build && npm run preview` y correr Lighthouse contra `http://localhost:4321`.
2. Iterar sobre hallazgos:
   - Imágenes sin lazy
   - Falta de `alt`
   - Botones sin `aria-label`
   - Contraste insuficiente
   - JS no usado
3. Verificar que el build no incluye React en páginas donde no hay islas (Astro lo hace bien por default; verificar `dist/_astro/` no infla).

**Criterios de aceptación**:

- [ ] Performance ≥ 95 mobile y desktop
- [ ] SEO = 100
- [ ] A11y = 100
- [ ] Best Practices = 100
- [ ] Total bundle JS transferido < 50KB en página inicial

---

### T24 Deploy a Cloudflare Pages

**Objetivo**: Producción en `cleverum.org` servida por Cloudflare Pages.

**Dependencias**: T23.

**Pasos**:

1. Crear proyecto en CF Pages, conectar el repo de GitHub.
2. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output: `dist`
   - Node version: `20`
3. Primer deploy desde `main`.
4. Configurar dominio personalizado `cleverum.org`:
   - Si el DNS ya está en Cloudflare → 1 click
   - Si está en otro registrar → crear CNAME a `<project>.pages.dev`
5. Activar Cloudflare Web Analytics (sin cookies, sin GDPR banner).
6. Test final en producción: Lighthouse + share OG + mobile real.

**Criterios de aceptación**:

- [ ] `https://cleverum.org` sirve la landing con SSL válido
- [ ] OG card funciona al compartir
- [ ] Web Analytics empieza a recibir datos
- [ ] PR a `main` genera preview deployment con URL temporal

---

## Convenciones globales

- Todo PR cierra exactamente 1 ticket y referencia su ID en el título: `[T11] Hero section`.
- Commits convencionales: `feat(hero): ...`, `fix(brands): ...`, `chore(deps): ...`.
- Antes de merge: `npm run build && npm run astro check && npm run lint` pasan.
- No introducir librerías nuevas sin justificarlo en la descripción del PR.
- Capturas de pantalla obligatorias en PRs que afecten UI.
