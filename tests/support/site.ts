import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { COPY, ROOT } from './env';

/** Puts the throwaway copy's content back exactly as it is in the real project. */
export function resetContent() {
  for (const dir of ['src/content', 'src/data', 'src/assets']) {
    execFileSync('rsync', ['-a', '--delete', `${path.join(ROOT, dir)}/`, `${path.join(COPY, dir)}/`]);
  }
}
export const readCopy = (rel: string) => fs.readFileSync(path.join(COPY, rel), 'utf8');
export const existsInCopy = (rel: string) => fs.existsSync(path.join(COPY, rel));
export const readRoot = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
export const orderJson = () => JSON.parse(readRoot('src/data/order.json')) as { work: string[]; timeline: string[] };

/** A tiny valid PNG (1x1) for upload tests. */
export const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
