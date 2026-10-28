import type { APIRoute } from 'astro';
import { guard, json } from '../../../lib/editor/auth';
import { Conflict, list, read, write } from '../../../lib/editor/storage';

export const prerender = false;

// Saves the order of case studies or journey steps (one small file, so one change in the history).
export const PUT: APIRoute = async ({ request }) => {
  const blocked = guard(request, { change: true });
  if (blocked) return blocked;
  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  const ids = body?.ids;
  if (
    !['work', 'timeline'].includes(kind) ||
    !Array.isArray(ids) ||
    ids.some((i: unknown) => typeof i !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(i)) ||
    new Set(ids).size !== ids.length
  ) return json({ error: 'That order was not understood.' }, 400);

  try {
    // The list must be exactly the files that exist, so nothing can go missing or be invented.
    const existing = (await list(`src/content/${kind}`)).filter((f) => f.name.endsWith('.md')).map((f) => f.name.replace(/\.md$/, ''));
    if (existing.length !== ids.length || existing.some((i) => !ids.includes(i)))
      return json({ error: 'The list changed while you were arranging it. Reload the page and try again.' }, 409);

    const path = 'src/data/order.json';
    const current = await read(path);
    let data: { work?: string[]; timeline?: string[] } = {};
    try { data = JSON.parse(current?.text ?? '{}'); } catch {}
    data[kind as 'work' | 'timeline'] = ids;
    const text = JSON.stringify({ work: data.work ?? [], timeline: data.timeline ?? [] }, null, 2) + '\n';
    await write(path, text, `Reorder ${kind === 'work' ? 'Work History' : 'My Journey'} from the edit page`, current?.sha);
    return json({ ok: true });
  } catch (e: any) {
    if (e instanceof Conflict) return json({ error: 'The order changed while saving. Reload the page and try again.' }, 409);
    return json({ error: e.message ?? 'Could not save the order.' }, 502);
  }
};
