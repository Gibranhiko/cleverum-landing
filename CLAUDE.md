# CLAUDE.md — Cleverum Landing

## 1. Qué es

Landing única `cleverum.org`. Portafolio con **3 marcas equitativas**:

- **Devindry** — desarrollo web/mobile
- **Cleverum** — automatización IA (marca paraguas)
- **Wabbi** — chatbots WhatsApp

Mercado: México/LATAM. **Solo español**. CTA único: WhatsApp directo.

Owner: Gibran Villarreal · `gibran.villarreal@cleverum.com` · `+52 55 4143 3545`.

## 2. Filosofía

- Static-first. HTML pre-renderizado por default. JS cliente solo si la interacción lo justifica
- SEO 100. SSG + structured data + metadata. Página entendible sin JS
- Performance = feature. LCP <1.5s, JS inicial <50KB, Lighthouse 95+
- Visualmente sorprendente, técnicamente ligero. WebGL solo donde aporta narrativa
- Copy vive en `src/content/site.ts`. Nunca hardcodear texto en componentes

## 3. Stack

| Capa | Paquete |
|---|---|
| Framework | Astro 5 (`output: 'static'`) |
| Islas | React 19 |
| Estilos | Tailwind CSS v4 |
| Scroll anim | GSAP 3 + ScrollTrigger |
| 3D/WebGL | React Three Fiber + drei + three.js |
| Iconos | `lucide-astro` (`lucide-react` solo en islas) |
| Fuentes | `astro:fonts` — Geist (display) + Inter (body) |
| YouTube | `@astro-community/astro-embed-youtube` (lite, lazy) |
| Hosting | Cloudflare Pages (static, free) |
| Analytics | Cloudflare Web Analytics (sin cookies) |

No agregar deps sin razón fuerte.

## 4. Estructura

```
src/
├── pages/index.astro          # Composición de secciones
├── layouts/BaseLayout.astro   # <head>, SEO, view transitions
├── components/
│   ├── sections/*.astro       # HTML puro, sin JS cliente
│   ├── react/*.tsx            # Islas React (3D, scroll, reveals)
│   ├── ui/*.astro             # Átomos reutilizables
│   └── three/                 # Shaders, helpers WebGL
├── content/site.ts            # Toda la copy + datos
├── styles/global.css          # Tailwind + tokens
└── lib/                       # Helpers puros
```

Sin state/listeners → `.astro`. Con → `.tsx` isla, directiva mínima.

## 5. Directivas de islas

| Directiva | Cuándo |
|---|---|
| `client:load` | Casi nunca. Solo si necesita primer paint |
| `client:idle` | Interacciones no críticas (ej. ScrollProgress) |
| `client:visible` | Default: 3D, animaciones scroll, reveals |
| `client:media` | Depende de breakpoint (ej. no 3D mobile) |

Nunca `client:only` salvo incompatible con SSR.

## 6. Contenido

Editar copy = editar `src/content/site.ts`:

```ts
site = {
  brand, contact: { phone, email, whatsapp: { number, prefilledMessage } },
  hero, manifesto: { words },
  brands: [
    { id: 'devindry', name, color, bullets, youtubeId: null },
    { id: 'cleverum', ... },
    { id: 'wabbi', ... },
  ],
}
```

`youtubeId: null` → `YouTubeLite` muestra placeholder "Próximamente". Pegar ID cuando exista video.

## 7. Diseño

Tokens en `src/styles/global.css` como CSS vars. Tailwind v4 los lee auto.

```
--bg-base:    #08080B
--bg-elev:    #111114
--brand-blue: #4F8AF7   (Devindry)
--brand-iris: #7C5CFF   (Cleverum)
--brand-grape:#A855F7
--accent-go:  #22C55E   (Wabbi/WhatsApp)
--text-1:     #FFFFFF
--text-2:     #B4B4BF
--border:     rgba(255,255,255,0.08)
```

No hardcodear colores. Tono nuevo → token nuevo.

Tipografía: display `clamp(2.5rem, 8vw, 9rem)`. Body 1.125rem línea 1.6.
Spacing: múltiplos de 4. Secciones `py-24 md:py-32 lg:py-40`.

## 8. Animación

- Un solo `ScrollProgressProvider` expone `scrollProgress` (0–1) vía Context. Islas leen de ahí, no instancian su propio ScrollTrigger
- 3D / shader uniforms → `scrub: true` de ScrollTrigger
- Reveals de texto → CSS scroll-driven nativo (`animation-timeline: view()`)
- GSAP solo si nativo no alcanza
- Partículas: desktop ≤8000 instanced; mobile (<768px) fallback gradient mesh CSS, no Canvas

## 9. Accesibilidad

- `prefers-reduced-motion`: desactivar scrub 3D, estados finales estáticos
- Contraste AA mínimo
- `:focus-visible` ring 2px brand
- Semántica: `<header>`, `<main>`, `<section>`, `<footer>`, headings jerarquizados
- YouTube con `title` descriptivo

## 10. SEO

- `<title>` único <60 chars
- `<meta description>` <160 chars
- Open Graph + Twitter card completos
- OG image al build (1200×630)
- JSON-LD: `Organization`, `Service` (×3, una por marca), `LocalBusiness`, `Person`, `VideoObject` (cuando haya videos)
- Sitemap (`@astrojs/sitemap`), `robots.txt`, canonical URL
- Imágenes `<Image>` Astro (AVIF/WebP) + `alt` descriptivo
- Hreflang innecesario (solo ES)

## 11. Performance budgets

| Métrica | Budget |
|---|---|
| LCP | <1.5s |
| CLS | <0.05 |
| TBT | <100ms |
| JS inicial | <50KB |
| Página total (sin video) | <300KB |
| FPS 3D | 60 desktop / 30 mobile |
| Lighthouse Perf | ≥95 |
| Lighthouse SEO/BP/A11y | 100 |

Rompe budget → simplificar o descartar.

## 12. Comandos

```bash
npm run dev          # Astro dev server
npm run build        # Build estático
npm run preview      # Preview del build
npm run astro check  # Type-check de .astro
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Antes de cerrar ticket: `npm run build && npm run astro check` limpios.

## 13. Deployment

Cloudflare Pages conectado al repo. Output `dist`. Dominio `cleverum.org`. Preview deploys por PR. Web Analytics activado (sin cookies, sin banner GDPR).

## 14. Plan

Tickets en [docs/dev-plan.md](docs/dev-plan.md). Seguir orden de epics.
