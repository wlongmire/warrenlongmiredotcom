import type { APIRoute } from 'astro';
import { guard, json } from '../../../lib/editor/auth';
import { readBytes } from '../../../lib/editor/storage';
import { IMAGE_TYPES, previewablePath } from '../../../lib/editor/rules';

export const prerender = false;

// Sends a picture from the site's picture folders to the editor so it can show a preview. Sign-in required.
export const GET: APIRoute = async ({ request }) => {
  const blocked = guard(request);
  if (blocked) return blocked;
  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!previewablePath(path)) return json({ error: 'That picture cannot be previewed.' }, 400);
  try {
    const bytes = await readBytes(path);
    if (!bytes) return json({ error: 'Not uploaded yet.' }, 404);
    if (bytes.length > 4_200_000) return json({ error: 'Too large to preview.' }, 413);
    const ext = path.split('.').pop()!.toLowerCase();
    return new Response(bytes, { headers: { 'content-type': IMAGE_TYPES[ext], 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex', 'x-content-type-options': 'nosniff' } });
  } catch (e: any) {
    return json({ error: e.message ?? 'Could not load the picture.' }, 502);
  }
};
