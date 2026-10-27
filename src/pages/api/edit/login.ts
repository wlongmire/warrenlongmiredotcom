import type { APIRoute } from 'astro';
import { checkPassword, json, lockedFor, makeSessionCookie, passwordConfigured, recordFailure, recordSuccess, sameSiteRequest } from '../../../lib/editor/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameSiteRequest(request)) return json({ error: 'Request blocked.' }, 403);
  if (!passwordConfigured()) return json({ error: 'No password is set yet. Add EDIT_PASSWORD in the site settings.' }, 503);
  const wait = lockedFor(request);
  if (wait) return json({ error: `Too many wrong tries. Please wait ${Math.ceil(wait / 60)} minutes.` }, 429);

  const body = await request.json().catch(() => null);
  if (!checkPassword(String(body?.password ?? ''))) {
    recordFailure(request);
    await new Promise((r) => setTimeout(r, 700)); // a short pause makes guessing slower
    return json({ error: 'That password is not right.' }, 401);
  }
  recordSuccess(request);
  const secure = new URL(request.url).protocol === 'https:';
  return json({ ok: true }, 200, { 'set-cookie': makeSessionCookie(secure) });
};
