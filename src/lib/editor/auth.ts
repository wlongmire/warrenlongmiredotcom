// Login, sessions and request checks for /edit. No packages: only Node's built-in crypto.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { env, SESSION_HOURS } from './config';

const COOKIE = 'edit_session';

export const passwordConfigured = () => !!env('EDIT_PASSWORD');

const sha = (s: string) => createHash('sha256').update(s).digest();

// The signing key is derived from the password, so changing the password signs everyone out.
const key = () => sha('edit-session:' + (env('EDIT_PASSWORD') ?? ''));

const sign = (payload: string) => createHmac('sha256', key()).update(payload).digest('hex');

/** Constant-time password check. */
export function checkPassword(input: string): boolean {
  const real = env('EDIT_PASSWORD');
  if (!real) return false;
  return timingSafeEqual(sha(input), sha(real));
}

export function makeSessionCookie(secure: boolean): string {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `v1.${exp}`;
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure ? '; Secure' : ''}`;
}

export const clearSessionCookie = (secure: boolean) =>
  `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;

function readCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE) return v.join('=');
  }
  return null;
}

export function isAuthed(request: Request): boolean {
  if (!passwordConfigured()) return false;
  const token = readCookie(request.headers.get('cookie'));
  if (!token) return false;
  const m = token.match(/^(v1\.(\d+))\.([0-9a-f]{64})$/);
  if (!m) return false;
  const [, payload, exp, sig] = m;
  if (Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(payload), 'hex');
  const given = Buffer.from(sig, 'hex');
  return good.length === given.length && timingSafeEqual(good, given);
}

/** Changes (POST/PUT) must come from this site itself and carry our header. Blocks cross-site requests. */
export function sameSiteRequest(request: Request): boolean {
  if (request.headers.get('x-edit') !== '1') return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

// --- Slow down password guessing: 5 misses locks that visitor out for 15 minutes. ---
// Held in memory, so it resets when the server instance restarts; it is a speed bump, not a vault.
const attempts = new Map<string, { fails: number; lockedUntil: number }>();
const clientKey = (request: Request) => (request.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();

export function lockedFor(request: Request): number {
  const a = attempts.get(clientKey(request));
  return a && a.lockedUntil > Date.now() ? Math.ceil((a.lockedUntil - Date.now()) / 1000) : 0;
}
export function recordFailure(request: Request) {
  const k = clientKey(request);
  const a = attempts.get(k) ?? { fails: 0, lockedUntil: 0 };
  a.fails += 1;
  if (a.fails >= 5) { a.lockedUntil = Date.now() + 15 * 60_000; a.fails = 0; }
  attempts.set(k, a);
}
export const recordSuccess = (request: Request) => attempts.delete(clientKey(request));

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...headers },
  });
}

/** Returns an error Response when the caller may not proceed, otherwise null. */
export function guard(request: Request, { change = false } = {}): Response | null {
  if (!isAuthed(request)) return json({ error: 'Please sign in again.' }, 401);
  if (change && !sameSiteRequest(request)) return json({ error: 'Request blocked.' }, 403);
  return null;
}
