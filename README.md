# Cleverum Landing

Landing oficial de **Cleverum** en `cleverum.org`. Muestra el portafolio de tres marcas: **Devindry** (desarrollo web/mobile), **Cleverum** (automatización con IA) y **Wabbi** (chatbots de WhatsApp).

Stack: Astro 5 (static) · React 19 (islas) · Tailwind v4 · GSAP · React Three Fiber. Hosted en Cloudflare Pages.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor local en http://localhost:4321
npm run build      # build estático en dist/
npm run preview    # previsualizar el build
npm run check      # type-check de archivos .astro
npm run format     # prettier write
```

## Contexto

- **[CLAUDE.md](CLAUDE.md)** — guía técnica completa (filosofía, stack, reglas, performance budgets)
- **[docs/dev-plan.md](docs/dev-plan.md)** — plan de implementación ticket por ticket

## Deploy en Cloudflare Pages

1. En el dashboard de Cloudflare Pages, conectar este repo.
2. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `20` o superior
3. Configurar el dominio personalizado `cleverum.org`.
4. Activar Cloudflare Web Analytics (sin cookies — sin banner GDPR).

Cada PR genera un preview deployment automático.
