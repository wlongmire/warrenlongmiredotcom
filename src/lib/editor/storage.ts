// Reads and writes site files. On the live site that means GitHub (each save is a commit, which
// triggers a Vercel redeploy). On your own computer, with no GITHUB_TOKEN set, it uses the local files.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import nodePath from 'node:path';
import { env, REPO, BRANCH } from './config';

export type Entry = { name: string; path: string; sha: string };
export type Doc = { text: string; sha: string };

const useLocal = () => !env('GITHUB_TOKEN') && import.meta.env.DEV;
export const storageMode = () => (useLocal() ? 'local files' : env('GITHUB_TOKEN') ? 'GitHub' : 'not configured');
export const storageReady = () => useLocal() || !!env('GITHUB_TOKEN');

const gh = async (path: string, init: RequestInit = {}) =>
  fetch(`https://api.github.com/repos/${REPO()}/contents/${path.split('/').map(encodeURIComponent).join('/')}${init.method === 'PUT' ? '' : `?ref=${encodeURIComponent(BRANCH())}`}`, {
    ...init,
    cache: 'no-store',
    headers: {
      authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'portfolio-editor',
      ...(init.headers ?? {}),
    },
  });

const localSha = (buf: Buffer) => createHash('sha1').update(buf).digest('hex');
const abs = (p: string) => nodePath.join(process.cwd(), p);

export async function list(dir: string): Promise<Entry[]> {
  if (useLocal()) {
    try {
      const names = await fs.readdir(abs(dir));
      const out: Entry[] = [];
      for (const name of names.sort()) {
        const st = await fs.stat(abs(`${dir}/${name}`));
        if (st.isFile()) out.push({ name, path: `${dir}/${name}`, sha: localSha(await fs.readFile(abs(`${dir}/${name}`))) });
      }
      return out;
    } catch { return []; }
  }
  const res = await gh(dir);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub said ${res.status} while listing ${dir}.`);
  const data = (await res.json()) as any[];
  return data.filter((e) => e.type === 'file').map((e) => ({ name: e.name, path: e.path, sha: e.sha }));
}

export async function read(path: string): Promise<Doc | null> {
  if (useLocal()) {
    try { const buf = await fs.readFile(abs(path)); return { text: buf.toString('utf8'), sha: localSha(buf) }; }
    catch { return null; }
  }
  const res = await gh(path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub said ${res.status} while reading ${path}.`);
  const data = (await res.json()) as any;
  return { text: Buffer.from(data.content ?? '', 'base64').toString('utf8'), sha: data.sha };
}

/** Just the current version id of a file (null when it does not exist). */
export async function shaOf(path: string): Promise<string | null> {
  if (useLocal()) {
    try { return localSha(await fs.readFile(abs(path))); } catch { return null; }
  }
  const res = await gh(path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub said ${res.status} while checking ${path}.`);
  return ((await res.json()) as any).sha ?? null;
}

export class Conflict extends Error {}

/** Writes a file. `sha` must be the version you last saw (omit it for a brand-new file). */
export async function write(path: string, data: string | Buffer, message: string, sha?: string): Promise<string> {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  if (useLocal()) {
    const current = await shaOf(path);
    if (current && current !== sha) throw new Conflict();
    if (!current && sha) throw new Conflict();
    await fs.mkdir(nodePath.dirname(abs(path)), { recursive: true });
    await fs.writeFile(abs(path), buf);
    return localSha(buf);
  }
  const res = await gh(path, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: buf.toString('base64'),
      branch: BRANCH(),
      ...(sha ? { sha } : {}),
      committer: { name: 'Portfolio editor', email: 'editor@users.noreply.github.com' },
    }),
  });
  if (res.status === 409 || res.status === 422) throw new Conflict();
  if (!res.ok) throw new Error(`GitHub said ${res.status} while saving ${path}.`);
  return ((await res.json()) as any).content.sha;
}
