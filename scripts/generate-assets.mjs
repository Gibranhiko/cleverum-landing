/**
 * Genera todos los assets PNG (OG image + favicons) a partir de los SVG fuente.
 *
 * Se ejecuta una vez con `npm run gen:assets` y los archivos quedan
 * versionados en /public. No corre en cada build para evitar dependencia
 * pesada en la pipeline de CI (Cloudflare Pages).
 */

import sharp from 'sharp';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');
const publicDir = resolve(root, 'public');
const scriptsDir = resolve(root, 'scripts');
const sourcesDir = resolve(scriptsDir, 'sources');

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

async function optimizeLogo(srcPath, outPath, size = 128) {
  await ensureDir(outPath);
  const beforeBytes = (await stat(srcPath)).size;
  await sharp(srcPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, quality: 92, palette: true })
    .toFile(outPath);
  const afterBytes = (await stat(outPath)).size;
  const ratio = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
  console.log(
    `  → ${basename(outPath)} (${size}×${size}, ${(afterBytes / 1024).toFixed(1)} KB · ${ratio}% más chico)`,
  );
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

  // 3) Logos de marca (Devindry / Cleverum / Wabbi)
  // Originales viven en scripts/sources/logos/ (versionados como backup).
  // Salida optimizada a 128×128 PNG en public/logos/ — cubre 64 (BrandCard),
  // 48 (Footer) y 32 (Navbar) con buffer 2× para retina.
  console.log('\nLogos de marca:');
  const logosSrcDir = resolve(sourcesDir, 'logos');
  const logosOutDir = resolve(publicDir, 'logos');
  try {
    const files = await readdir(logosSrcDir);
    for (const file of files) {
      if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
      const src = resolve(logosSrcDir, file);
      const out = resolve(logosOutDir, file.replace(/\.(jpe?g|webp)$/i, '.png'));
      await optimizeLogo(src, out, 128);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('  (sin originales en scripts/sources/logos/ — skip)');
    } else {
      throw err;
    }
  }

  // 4) site.webmanifest
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
