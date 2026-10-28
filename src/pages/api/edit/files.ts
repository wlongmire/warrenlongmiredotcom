import type { APIRoute } from 'astro';
import { guard, json } from '../../../lib/editor/auth';
import { list, read, storageMode, storageReady } from '../../../lib/editor/storage';
import { sortByOrder, type OrderData } from '../../../lib/order';
import { resumeFiles } from '../../../lib/editor/rules';

export const prerender = false;

const titleOf = (text: string, fallback: string) =>
  text.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1]?.trim() || fallback;
const labelOf = (text: string) => text.match(/^label:\s*"?(.*?)"?\s*$/m)?.[1]?.trim() || '';
const orderOf = (text: string) => Number(text.match(/^order:\s*(\d+)/m)?.[1] ?? 999);

async function group(dir: string, kind: 'work' | 'timeline', order: OrderData) {
  const files = (await list(dir)).filter((f) => f.name.endsWith('.md'));
  const items = await Promise.all(
    files.map(async (f) => {
      const doc = await read(f.path);
      const title = titleOf(doc?.text ?? '', f.name);
      // My Journey shows the short tag (Design, Build, ...); everything else shows its title.
      const label = kind === 'timeline' ? labelOf(doc?.text ?? '') || title : title;
      return { path: f.path, name: f.name, label, title, order: orderOf(doc?.text ?? '') };
    }),
  );
  // The same order they appear on the site (from src/data/order.json, read live).
  return sortByOrder(items.map((i) => ({ ...i, id: i.name.replace(/\.md$/, ''), data: { order: i.order } })), kind, order)
    .map(({ path, name, label, title }) => ({ path, name, label, title }));
}

export const GET: APIRoute = async ({ request }) => {
  const blocked = guard(request);
  if (blocked) return blocked;
  if (!storageReady()) return json({ error: 'GITHUB_TOKEN is not set, so there is nowhere to save yet.' }, 503);
  try {
    let order: OrderData = {};
    try { order = JSON.parse((await read('src/data/order.json'))?.text ?? '{}'); } catch {}
    const [work, timeline] = await Promise.all([group('src/content/work', 'work', order), group('src/content/timeline', 'timeline', order)]);
    return json({
      mode: storageMode(),
      work,
      timeline,
      about: { path: 'src/content/pages/about.md', label: 'Home page intro' },
      site: { path: 'src/data/site.json', label: 'Footer & contact form' },
      resumes: resumeFiles(),
    });
  } catch (e: any) {
    return json({ error: e.message ?? 'Could not load the file list.' }, 502);
  }
};
