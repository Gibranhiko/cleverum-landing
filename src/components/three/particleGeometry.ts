/**
 * Generadores de posiciones para el ParticleField.
 *
 * - createCloudPositions(count, radius): nube esférica difusa — estado inicial (Hero).
 * - createGridPositions(count, size):   red 3D ordenada — estado medio (sección Cleverum).
 * - createConstellationPositions(count): clusters dispersos — estado final (CTA).
 *
 * Todas las funciones producen Float32Array de longitud `count * 3` con
 * componentes (x, y, z) en el rango ~[-radius, radius].
 *
 * Los tres buffers viven en paralelo y se interpolan en el shader (T8) según
 * `uProgress` (0–1).
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Distribución Fibonacci sphere con jitter radial. */
export function createCloudPositions(count: number, radius = 3): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    const jitter = 0.55 + Math.random() * 0.5;
    out[i * 3] = Math.cos(theta) * r * radius * jitter;
    out[i * 3 + 1] = y * radius * jitter;
    out[i * 3 + 2] = Math.sin(theta) * r * radius * jitter;
  }
  return out;
}

/** Rejilla 3D estructurada (grafo) con leve aleatoriedad. */
export function createGridPositions(count: number, size = 5): Float32Array {
  const out = new Float32Array(count * 3);
  const side = Math.ceil(Math.cbrt(count));
  const step = size / side;
  const half = size / 2;
  let i = 0;
  for (let x = 0; x < side && i < count; x++) {
    for (let y = 0; y < side && i < count; y++) {
      for (let z = 0; z < side && i < count; z++) {
        const jx = (Math.random() - 0.5) * step * 0.25;
        const jy = (Math.random() - 0.5) * step * 0.25;
        const jz = (Math.random() - 0.5) * step * 0.25;
        out[i * 3] = x * step - half + step / 2 + jx;
        out[i * 3 + 1] = y * step - half + step / 2 + jy;
        out[i * 3 + 2] = z * step - half + step / 2 + jz;
        i++;
      }
    }
  }
  return out;
}

/** Clusters dispersos formando una constelación. */
export function createConstellationPositions(count: number, spread = 6): Float32Array {
  const out = new Float32Array(count * 3);
  const clusters = 7;
  const centers: [number, number, number][] = [];
  for (let c = 0; c < clusters; c++) {
    centers.push([
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.7,
      (Math.random() - 0.5) * spread,
    ]);
  }
  for (let i = 0; i < count; i++) {
    const c = centers[i % clusters]!;
    const r = Math.random() * 0.8;
    const t1 = Math.random() * Math.PI * 2;
    const t2 = Math.acos(2 * Math.random() - 1);
    out[i * 3] = c[0] + r * Math.sin(t2) * Math.cos(t1);
    out[i * 3 + 1] = c[1] + r * Math.sin(t2) * Math.sin(t1);
    out[i * 3 + 2] = c[2] + r * Math.cos(t2);
  }
  return out;
}

export interface ParticleAttributes {
  cloud: Float32Array;
  grid: Float32Array;
  constellation: Float32Array;
}

/** Genera los tres buffers de target a la vez. */
export function createParticleAttributes(count: number): ParticleAttributes {
  return {
    cloud: createCloudPositions(count),
    grid: createGridPositions(count),
    constellation: createConstellationPositions(count),
  };
}
