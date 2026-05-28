// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://cleverum.org',
  output: 'static',
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Split heavy 3D vendor deps into their own chunks.
      // - three.js alone is ~600 KB; isolate it so browser caches across deploys.
      // - r3f + drei live together (~150 KB).
      // - The ParticleField wrapper shrinks to its actual code.
      // ParticleField only loads via client:media (desktop, no reduced-motion),
      // so none of this is in the critical render path.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three/')) return 'vendor-three';
            if (id.includes('node_modules/@react-three/')) return 'vendor-r3f';
          },
        },
      },
      // Raise warning threshold — three.js is intentionally large and lazy.
      chunkSizeWarningLimit: 800,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  experimental: {
    clientPrerender: true,
  },
});
