/// <reference types="@cloudflare/workers-types" />
import type { Env } from './types';
import { CORS_HEADERS } from './types';

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return context.next();
};
