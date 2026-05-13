/**
 * Singleton observer del scroll progress global (0–1).
 *
 * Astro hidrata cada isla por separado, así que React Context no cruza
 * fronteras de isla. Este singleton vive fuera de React y permite que
 * múltiples islas (barra de progreso, ParticleField, etc.) compartan
 * el mismo valor con un único listener de scroll global throttled con rAF.
 */

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let currentProgress = 0;
let rafId: number | null = null;
let started = false;

function compute(): void {
  rafId = null;
  if (typeof window === 'undefined') return;

  const scrolled = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const next = max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0;

  if (next === currentProgress) return;
  currentProgress = next;

  listeners.forEach((l) => l(currentProgress));
}

function onScroll(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(compute);
}

function start(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Recalcular si cambian elementos (ej. después de hidratación de islas)
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
  }
  compute();
}

/**
 * Suscribirse al scroll progress global.
 * Retorna una función para desuscribirse.
 * Llama al listener inmediatamente con el valor actual.
 */
export function subscribeScrollProgress(listener: Listener): () => void {
  start();
  listeners.add(listener);
  listener(currentProgress);
  return () => {
    listeners.delete(listener);
  };
}

/** Lectura síncrona del valor actual. */
export function getScrollProgress(): number {
  return currentProgress;
}
