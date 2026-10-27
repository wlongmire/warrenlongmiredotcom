import type { APIRoute } from 'astro';
import { clearSessionCookie, json, sameSiteRequest } from '../../../lib/editor/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameSiteRequest(request)) return json({ error: 'Request blocked.' }, 403);
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie(new URL(request.url).protocol === 'https:') });
};
