import type { APIRoute } from 'astro';
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import { guard, json } from '../../../lib/editor/auth';
import { Conflict, read, shaOf, write } from '../../../lib/editor/storage';
import { canCreate, kindOf, validateMarkdown, validateSite } from '../../../lib/editor/rules';

export const prerender = false;

const pathOf = (url: string) => new URL(url).searchParams.get('path') ?? '';

export const GET: APIRoute = async ({ request }) => {
  const blocked = guard(request);
  if (blocked) return blocked;
  const path = pathOf(request.url);
  const kind = kindOf(path);
  if (!kind) return json({ error: 'That file cannot be edited here.' }, 400);
  try {
    const doc = await read(path);
    if (!doc) return json({ error: 'That file was not found.' }, 404);
    if (kind === 'site') {
      // Shown as a plain text file; the contact-form address is not part of it.
      const { contactEndpoint, ...rest } = JSON.parse(doc.text);
      return json({ path, kind, text: yamlDump(rest, { lineWidth: 100 }), sha: doc.sha });
    }
    return json({ path, kind, text: doc.text, sha: doc.sha });
  } catch (e: any) {
    return json({ error: e.message }, 502);
  }
};

async function save(request: Request, creating: boolean) {
  const blocked = guard(request, { change: true });
  if (blocked) return blocked;
  const body = await request.json().catch(() => null);
  const path = String(body?.path ?? '');
  const kind = kindOf(path);
  if (!kind || (creating && !canCreate(path))) return json({ error: 'That file cannot be edited here.' }, 400);
  let text = String(body?.text ?? '');
  try {
    const current = await shaOf(path);
    if (creating && current) return json({ error: 'A file with that name already exists.' }, 409);
    if (!creating && !current) return json({ error: 'That file no longer exists.' }, 404);
    if (!creating && String(body?.sha ?? '') !== current)
      return json({ error: 'Someone else changed this file after you opened it. Reload it to see their changes.' }, 409);

    let errors: string[];
    if (kind === 'site') {
      let asJson: string;
      try { asJson = JSON.stringify(yamlLoad(text)); } catch (e: any) {
        return json({ error: 'Not saved. Please fix this first:', problems: [`That text has a formatting problem: ${String(e.reason ?? e.message ?? e).split('\n')[0]}`] }, 422);
      }
      const r = validateSite(asJson, (await read(path))?.text ?? null);
      errors = r.errors; text = r.text;
    } else {
      text = text.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
      errors = await validateMarkdown(path, text);
    }
    if (errors.length) return json({ error: 'Not saved. Please fix this first:', problems: errors }, 422);

    const sha = await write(path, text, `${creating ? 'Add' : 'Edit'} ${path} from the edit page`, creating ? undefined : current!);
    return json({ ok: true, sha });
  } catch (e: any) {
    if (e instanceof Conflict) return json({ error: 'The file changed while saving. Reload it and try again.' }, 409);
    return json({ error: e.message ?? 'Saving failed.' }, 502);
  }
}

export const PUT: APIRoute = ({ request }) => save(request, false);
export const POST: APIRoute = ({ request }) => save(request, true);
