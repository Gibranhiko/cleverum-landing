import { useEffect, useState } from 'react';
import { getScrollProgress, subscribeScrollProgress } from '~/lib/scrollProgress';

/**
 * Hook React que reactiva al scroll progress global (0–1).
 * Cada isla que lo use comparte el mismo singleton — un solo listener de scroll.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : getScrollProgress(),
  );

  useEffect(() => subscribeScrollProgress(setProgress), []);

  return progress;
}
