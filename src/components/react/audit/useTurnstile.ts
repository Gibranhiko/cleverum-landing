import { useEffect, useRef, useState } from 'react';

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  size?: 'normal' | 'invisible' | 'compact' | 'flexible';
  theme?: 'auto' | 'light' | 'dark';
  appearance?: 'always' | 'execute' | 'interaction-only';
}

interface TurnstileApi {
  render: (
    el: HTMLElement | string,
    options: TurnstileRenderOptions,
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  execute: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __cfTurnstileOnLoad?: () => void;
  }
}

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__cfTurnstileOnLoad&render=explicit';

let loadingPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no_window'));
  if (window.turnstile) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-cf-turnstile]',
    ) as HTMLScriptElement | null;
    if (existing && window.turnstile) {
      resolve();
      return;
    }
    window.__cfTurnstileOnLoad = () => resolve();
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.dataset.cfTurnstile = 'true';
    s.onerror = () => reject(new Error('turnstile_script_failed'));
    document.head.appendChild(s);
  });

  return loadingPromise;
}

export interface UseTurnstileResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  ready: boolean;
  error: string | null;
  execute: () => void;
  reset: () => void;
}

export function useTurnstile(
  sitekey: string | undefined,
  onToken: (token: string) => void,
): UseTurnstileResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sitekey) {
      setError('missing_site_key');
      return;
    }
    if (!containerRef.current) return;

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey,
            size: 'invisible',
            theme: 'dark',
            appearance: 'execute',
            callback: (token) => onTokenRef.current(token),
            'error-callback': () => setError('turnstile_error'),
            'expired-callback': () => {
              if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
              }
            },
          });
          widgetIdRef.current = id;
          setReady(true);
        } catch {
          setError('turnstile_render_failed');
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'turnstile_load_failed');
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [sitekey]);

  return {
    containerRef,
    ready,
    error,
    execute: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.execute(widgetIdRef.current);
      }
    },
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  };
}
