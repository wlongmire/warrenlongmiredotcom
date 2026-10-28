// The order of case studies and journey steps lives in src/data/order.json (one list per kind, by file name).
// The /edit page changes that file when you drag items around. Anything not in the list goes after the listed
// ones (so a brand-new item simply lands last), then by an old-style `order:` number if a file still has one.
import orderData from '../data/order.json';

export type OrderData = { work?: string[]; timeline?: string[] };

export function sortByOrder<T extends { id: string; data: { order?: number } }>(
  items: T[],
  kind: 'work' | 'timeline',
  data: OrderData = orderData as OrderData,
): T[] {
  const list = data[kind] ?? [];
  const rank = (e: T) => {
    const i = list.indexOf(e.id);
    return i >= 0 ? i : 1000 + (e.data.order ?? 999);
  };
  return [...items].sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
}
