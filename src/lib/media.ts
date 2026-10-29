// Turns the picture names written in a `media:` list into real image files.
// A picture can be written as just its file name ("my-picture.jpg"): it is looked up in the folder for that
// kind of page (src/assets/work/ for case studies, src/assets/timeline/ for journey steps).
// The older full path ("../../assets/work/my-picture.jpg") still works.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{jpg,jpeg,png,webp}', { eager: true });

/** `folder` is where a bare file name is looked up: src/assets/work, src/assets/timeline, or src/assets itself ('root'). */
export function resolveImage(folder: 'work' | 'timeline' | 'root', src: string): ImageMetadata {
  const clean = src.trim();
  const key = clean.startsWith('../../assets/') ? `/src/assets/${clean.slice('../../assets/'.length)}` : (folder === 'root' ? `/src/assets/${clean}` : `/src/assets/${folder}/${clean}`);
  const hit = files[key];
  if (!hit) throw new Error(`Picture "${src}" was not found. Upload it on the /edit page, or put it in src/assets/${folder === 'root' ? '' : folder + '/'}.`);
  return hit.default;
}

/** Same list, with every picture's src swapped for the real image (videos pass through untouched). */
export function resolveMedia<T extends { type: string; src?: string }>(folder: 'work' | 'timeline', list: T[]): any[] {
  return list.map((m) => (m.type === 'image' && typeof m.src === 'string' ? { ...m, src: resolveImage(folder, m.src) } : m));
}
