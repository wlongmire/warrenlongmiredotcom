import type { APIRoute } from 'astro';
import { guard, json } from '../../../lib/editor/auth';
import { list, read, storageMode, storageReady } from '../../../lib/editor/storage';
import { resumeFiles } from '../../../lib/editor/rules';

export const prerender = false;

const titleOf = (text: string, fallback: string) =>
  text.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1]?.trim() || fallback;
const orderOf = (text: string) => Number(text.match(/^order:\s*(\d+)/m)?.[1] ?? 999);

async function group(dir: string) {
  const files = (await list(dir)).filter((f) => f.name.endsWith('.md'));
  const items = await Promise.all(
    files.map(async (f) => {
      const doc = await read(f.path);
      return { path: f.path, name: f.name, label: titleOf(doc?.text ?? '', f.name), order: orderOf(doc?.text ?? '') };
    }),
  );
  // The same order they appear on the site.
  return items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export const GET: APIRoute = async ({ request }) => {
  const blocked = guard(request);
  if (blocked) return blocked;
  if (!storageReady()) return json({ error: 'GITHUB_TOKEN is not set, so there is nowhere to save yet.' }, 503);
  try {
    const [work, timeline] = await Promise.all([group('src/content/work'), group('src/content/timeline')]);
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
