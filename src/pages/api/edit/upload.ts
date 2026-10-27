import type { APIRoute } from 'astro';
import { guard, json } from '../../../lib/editor/auth';
import { MAX_UPLOAD_BYTES } from '../../../lib/editor/config';
import { Conflict, shaOf, write } from '../../../lib/editor/storage';
import { planUpload, type UploadTarget } from '../../../lib/editor/rules';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = guard(request, { change: true });
  if (blocked) return blocked;
  let form: FormData;
  try { form = await request.formData(); } catch { return json({ error: 'The upload was not understood.' }, 400); }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return json({ error: 'Choose a file first.' }, 400);
  if (file.size > MAX_UPLOAD_BYTES) return json({ error: 'That file is over 4 MB. Make it smaller, or add it directly on github.com.' }, 413);

  const bytes = Buffer.from(await file.arrayBuffer());
  const plan = planUpload(String(form.get('target')) as UploadTarget, file.name, bytes, String(form.get('resumeId') ?? ''));
  if ('error' in plan) return json({ error: plan.error }, 400);

  try {
    const existing = await shaOf(plan.path);
    await write(plan.path, bytes, `${existing ? 'Replace' : 'Add'} ${plan.path} from the edit page`, existing ?? undefined);
    return json({ ok: true, path: plan.path, reference: plan.reference, replaced: !!existing });
  } catch (e: any) {
    if (e instanceof Conflict) return json({ error: 'The file changed while uploading. Try again.' }, 409);
    return json({ error: e.message ?? 'Upload failed.' }, 502);
  }
};
