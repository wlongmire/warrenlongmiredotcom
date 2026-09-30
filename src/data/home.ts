// Homepage constants. Case study cards themselves come from src/content/work/*.md.
export type Track = 'learning-design' | 'teaching' | 'engineering' | 'design-ux';

export const trackLabel: Record<Track, string> = {
  'learning-design': 'Learning Design',
  teaching: 'Teaching',
  engineering: 'Engineering',
  'design-ux': 'Design & UX',
};

export const identityLine =
  'Developer of curriculum, software and learning experiences for learners like you.';

export const filters = [
  { id: 'all', label: 'All' },
  { id: 'learning-design', label: 'Learning Design' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design-ux', label: 'Design & UX' },
] as const;
