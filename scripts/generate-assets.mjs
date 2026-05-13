/**
 * Genera todos los assets PNG (OG image + favicons) a partir de los SVG fuente.
 *
 * Se ejecuta una vez con `npm run gen:assets` y los archivos quedan
 * versionados en /public. No corre en cada build para evitar dependencia
 * pesada en la pipeline de CI (Cloudflare Pages).
 */

import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');
const publicDir = resolve(root, 'public');
const scriptsDir = resolve(root, 'scripts');

async function ensureDir(path) {
  await mkdir(dirname(path), { recursive: true });
}

async function svgToPng(svgPath, outPath, width, height) {
  const svg = await readFile(svgPath);
  await ensureDir(outPath);
  const image = sharp(svg, { density: 384 }).resize(width, height, { fit: 'contain' });
  await image.png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`  → ${outPath} (${width}×${height})`);
}

async function main() {
  console.log('Generando assets...\n');

  // 1) OG image (1200×630)
  console.log('OG image:');
  await svgToPng(
    resolve(scriptsDir, 'og-source.svg'),
    resolve(publicDir, 'og.png'),
    1200,
    630,
  );

  // 2) Favicons (a partir de favicon.svg).
  // Sólo generamos los tamaños que realmente referenciamos:
  //   - 16/32: <link rel="icon"> en BaseLayout
  //   - 180:   apple-touch-icon
  //   - 192/512: site.webmanifest (PWA / Android)
  // SVG cubre el resto de navegadores modernos.
  console.log('\nFavicons:');
  const faviconSvg = resolve(publicDir, 'favicon.svg');
  await svgToPng(faviconSvg, resolve(publicDir, 'favicon-16x16.png'), 16, 16);
  await svgToPng(faviconSvg, resolve(publicDir, 'favicon-32x32.png'), 32, 32);
  await svgToPng(faviconSvg, resolve(publicDir, 'apple-touch-icon.png'), 180, 180);
  await svgToPng(faviconSvg, resolve(publicDir, 'icon-192.png'), 192, 192);
  await svgToPng(faviconSvg, resolve(publicDir, 'icon-512.png'), 512, 512);

  // 3) site.webmanifest
  console.log('\nManifest:');
  const manifest = {
    name: 'Cleverum',
    short_name: 'Cleverum',
    description:
      'Automatización con IA, desarrollo web y mobile, y chatbots de WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08080B',
    theme_color: '#08080B',
    lang: 'es',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
  const manifestPath = resolve(publicDir, 'site.webmanifest');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  → ${manifestPath}`);

  console.log('\nListo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
