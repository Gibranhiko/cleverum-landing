# CLAUDE.md — Cleverum Landing

Guía de contexto para asistentes de IA trabajando en este repositorio.

## 1. Qué es esto

Landing page única para `cleverum.org`. Showcase del portafolio profesional con **tres marcas equitativas**:

- **Devindry** — Desarrollo web y mobile
- **Cleverum** — Automatización con IA (marca paraguas, mismo nombre del dominio)
- **Wabbi** — Chatbots inteligentes para WhatsApp

Mercado: México / LATAM. **Solo español**. CTA único: WhatsApp directo.

Owner: Gibran Villarreal · `gibran.villarreal@cleverum.com` · `+52 55 4143 3545`.

## 2. Filosofía

1. **Static-first**. Todo lo que pueda ser HTML pre-renderizado lo es. JavaScript al cliente solo cuando una interacción lo justifica.
2. **SEO de 100**. SSG + structured data + metadata completa. La página debe ser entendible por crawlers sin ejecutar JS.
3. **Performance es feature**. LCP < 1.5s. JS inicial < 50KB. Lighthouse 95+ en las 4 métricas.
4. **Visualmente sorprendente, técnicamente ligero**. WebGL solo donde aporta narrativa; el resto es CSS moderno.
5. **Una sola fuente de verdad para contenido**. Toda la copy vive en `src/content/site.ts`. No se hardcodea texto en componentes.

## 3. Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 5 (`output: 'static'`) |
| Islas interactivas | React 19 (solo donde se requiere) |
| Estilos | Tailwind CSS v4 |
| Scroll animation | GSAP 3 + ScrollTrigger |
| 3D / WebGL | React Three Fiber + drei + three.js |
| Iconos | `lucide-astro` (no `lucide-react` salvo en islas) |
| Fuentes | `astro:fonts` — Geist (display) + Inter (body) |
| YouTube embed | `@astro-community/astro-embed-youtube` (lite, lazy) |
| Hosting | Cloudflare Pages (static, free tier) |
| Analytics | Cloudflare Web Analytics (sin cookies) |

No agregar dependencias sin razón fuerte. Cada paquete cuesta KBs.

## 4. Estructura del proyecto

```
src/
├── pages/index.astro          # Composición de secciones
├── layouts/BaseLayout.astro   # <head>, SEO, view transitions
├── components/
│   ├── sections/*.astro       # HTML puro, sin JS cliente
│   ├── react/*.tsx            # Islas React (3D, scroll, reveals)
│   ├── ui/*.astro             # Átomos reutilizables
│   └── three/                 # Shaders, helpers WebGL
├── content/site.ts            # ⭐ Toda la copy + datos
├── styles/global.css          # Tailwind + tokens
└── lib/                       # Helpers puros
```

**Regla**: si un componente no necesita estado ni listeners, es `.astro`. Si los necesita, es `.tsx` y se monta como isla con la directiva mínima necesaria.

## 5. Reglas de islas React

| Directiva | Cuándo |
|---|---|
| `client:load` | Casi nunca. Solo si la isla debe estar lista en el primer paint. |
| `client:idle` | Interacciones no críticas que pueden esperar (ej. ScrollProgress). |
| `client:visible` | Default para todo lo demás: 3D, animaciones scroll, reveals. |
| `client:media` | Si depende de breakpoint (ej. no cargar 3D en mobile). |

**Nunca** usar `client:only` salvo que el componente sea fundamentalmente incompatible con SSR.

## 6. Sistema de contenido

Editar contenido = editar `src/content/site.ts`. Estructura:

```ts
export const site = {
  brand: { name, tagline, ... },
  contact: { phone, email, whatsapp: { number, prefilledMessage } },
  hero: { title, subtitle, ctaLabel },
  manifesto: { words: [...] },
  brands: [
    { id: 'devindry', name, color, bullets: [...], youtubeId: null },
    { id: 'cleverum', ... },
    { id: 'wabbi', ... },
  ],
  // ...
};
```

Los `youtubeId` empiezan en `null` → componente `YouTubeLite` muestra un placeholder "Próximamente". Cuando exista el video, se pega el ID y aparece automáticamente.

## 7. Sistema de diseño

Tokens en `src/styles/global.css` como CSS variables. Tailwind v4 los lee automáticamente.

```
--bg-base:    #08080B
--bg-elev:    #111114
--brand-blue: #4F8AF7   (Devindry)
--brand-iris: #7C5CFF   (Cleverum)
--brand-grape:#A855F7
--accent-go:  #22C55E   (Wabbi / WhatsApp)
--text-1:     #FFFFFF
--text-2:     #B4B4BF
--border:     rgba(255,255,255,0.08)
```

**No hardcodear colores en componentes**. Si necesitas un tono nuevo, agrégalo al token y úsalo desde Tailwind.

**Tipografía**: display fluid con `clamp(2.5rem, 8vw, 9rem)`. Body 1.125rem línea 1.6.

**Spacing**: múltiplos de 4. Secciones con `py-24 md:py-32 lg:py-40`.

## 8. Sistema de animación

**Un solo `ScrollProgressProvider`** expone `scrollProgress` (0–1) global vía Context. Las islas que necesitan scroll-driven leen de ahí, no instancian su propio ScrollTrigger.

- **3D / shader uniforms** → driven por `scrub: true` de ScrollTrigger
- **Reveals de texto** → preferir CSS scroll-driven animations nativas (`animation-timeline: view()`)
- **GSAP** solo cuando lo nativo no alcanza (interpolaciones complejas, timelines encadenadas)

**Performance del campo de partículas**:
- Desktop: ≤ 8.000 partículas, instanced mesh
- Mobile (`< 768px`): fallback a gradient mesh CSS, no Canvas

## 9. Accesibilidad

- Respetar `prefers-reduced-motion`: desactivar scrub 3D, mostrar estados finales estáticos
- Contraste mínimo AA en todo texto sobre fondo oscuro
- `:focus-visible` claramente visible (ring 2px brand)
- Semántica correcta: `<header>`, `<main>`, `<section>`, `<footer>`, headings jerarquizados
- Videos YouTube con `title` descriptivo

## 10. SEO requirements

Cada cambio que afecte SEO debe mantener:

- `<title>` único y descriptivo (< 60 chars)
- `<meta name="description">` (< 160 chars)
- Open Graph completo + Twitter card
- OG image generada al build (1200×630)
- JSON-LD: `Organization`, `Service` (×3, uno por marca), `LocalBusiness`, `Person`, `VideoObject` (cuando haya videos)
- Sitemap (`@astrojs/sitemap`)
- `robots.txt`
- Canonical URL
- Imágenes con `<Image>` de Astro (AVIF/WebP) y `alt` descriptivo
- Hreflang innecesario por ahora (solo ES)

## 11. Performance budgets

| Métrica | Budget |
|---|---|
| LCP | < 1.5s |
| CLS | < 0.05 |
| TBT | < 100ms |
| JS inicial transferido | < 50KB |
| Tamaño total página (sin video) | < 300KB |
| FPS animación 3D | 60fps desktop / 30fps mobile fallback |
| Lighthouse Performance | ≥ 95 |
| Lighthouse SEO / Best Practices / A11y | 100 |

Si una feature rompe el budget, se simplifica o se descarta.

## 12. Comandos

```bash
npm run dev          # Astro dev server
npm run build        # Build estático
npm run preview      # Preview del build
npm run astro check  # Type-check de archivos .astro
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Antes de declarar un ticket terminado: `npm run build && npm run astro check` deben pasar limpios.

## 13. Deployment

- Cloudflare Pages, conectado al repo
- Build command: `npm run build`
- Output directory: `dist`
- Dominio: `cleverum.org`
- Preview deployments en cada PR
- Web Analytics activado (no cookies, no banner GDPR)

## 14. Plan de desarrollo

Plan detallado ticket a ticket en [docs/dev-plan.md](docs/dev-plan.md). Seguir el orden de los epics.
