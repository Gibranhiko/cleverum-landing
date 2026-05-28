/**
 * Genera posiciones 3D para que las partículas formen un número (ej. "4.2")
 * cuando uAuditMix = 1 en el shader.
 *
 * Estrategia:
 *   1. Renderiza el número en un canvas 2D off-screen con font display.
 *   2. Lee pixels con alpha > umbral y los samplea uniformemente.
 *   3. Convierte coords pixel → world (centrado, escalado).
 *   4. Las partículas que no caben en el número orbitan a mayor radio
 *      (se usan TODAS para evitar saltos visuales).
 */

const PARTICLES_ON_DIGIT_RATIO = 0.7;
const PIXEL_SAMPLE_STRIDE = 2;

export interface DigitGeometryOptions {
  worldWidth?: number;
  worldHeight?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  fontFamily?: string;
}

export function generateDigitPositions(
  text: string,
  count: number,
  opts: DigitGeometryOptions = {},
): Float32Array {
  const result = new Float32Array(count * 3);
  if (typeof document === 'undefined' || count <= 0) return result;

  const W = opts.canvasWidth ?? 768;
  const H = opts.canvasHeight ?? 384;
  const worldW = opts.worldWidth ?? 6;
  const worldH = opts.worldHeight ?? 3;
  const font = opts.fontFamily ?? "'Geist Variable', system-ui, sans-serif";

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return result;

  // Render text — white on transparent
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  const fontSize = Math.floor(H * 0.78);
  ctx.font = `700 ${fontSize}px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);

  // Sample pixels above alpha threshold
  const img = ctx.getImageData(0, 0, W, H);
  const data = img.data;
  const samples: { x: number; y: number }[] = [];
  for (let y = 0; y < H; y += PIXEL_SAMPLE_STRIDE) {
    for (let x = 0; x < W; x += PIXEL_SAMPLE_STRIDE) {
      const idx = (y * W + x) * 4;
      if (data[idx + 3]! > 128) {
        samples.push({ x, y });
      }
    }
  }

  if (samples.length === 0) {
    // Fallback: distribute orbital only
    fillOrbital(result, 0, count, worldW, worldH);
    return result;
  }

  // Shuffle samples (Fisher-Yates)
  for (let i = samples.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = samples[i]!;
    samples[i] = samples[j]!;
    samples[j] = tmp;
  }

  const onDigitCount = Math.min(samples.length, Math.floor(count * PARTICLES_ON_DIGIT_RATIO));
  const orbitCount = count - onDigitCount;

  // Fill on-digit positions
  for (let i = 0; i < onDigitCount; i++) {
    const s = samples[i % samples.length]!;
    const wx = (s.x / W - 0.5) * worldW;
    const wy = -((s.y / H - 0.5) * worldH);
    const wz = (Math.random() - 0.5) * 0.2;
    result[i * 3] = wx;
    result[i * 3 + 1] = wy;
    result[i * 3 + 2] = wz;
  }

  fillOrbital(result, onDigitCount, orbitCount, worldW, worldH);
  return result;
}

function fillOrbital(
  arr: Float32Array,
  startIndex: number,
  count: number,
  worldW: number,
  worldH: number,
): void {
  const radiusBase = Math.max(worldW, worldH) * 0.6;
  const ellipseRatio = worldH / worldW;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = radiusBase + Math.random() * 0.7;
    const wx = Math.cos(angle) * r;
    const wy = Math.sin(angle) * r * ellipseRatio;
    const wz = (Math.random() - 0.5) * 0.6;
    const idx = (startIndex + i) * 3;
    arr[idx] = wx;
    arr[idx + 1] = wy;
    arr[idx + 2] = wz;
  }
}
