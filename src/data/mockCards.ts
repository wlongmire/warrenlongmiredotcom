// THROWAWAY: placeholder cards for the /mock-a, /mock-b, /mock-c comparison pages.
// Nothing here describes real work. Real case studies live in src/content/work/.
export type MockCard = {
  title: string;
  outcome: string;
  role: string;
  tracks: ('learning-design' | 'teaching' | 'engineering' | 'design-ux')[];
};

export const trackLabel: Record<MockCard['tracks'][number], string> = {
  'learning-design': 'Learning Design',
  teaching: 'Teaching',
  engineering: 'Engineering',
  'design-ux': 'Design & UX',
};

export const mockCards: MockCard[] = [
  { title: 'Case study title one', outcome: 'One-line outcome goes here, plain and specific.', role: 'Role placeholder', tracks: ['learning-design'] },
  { title: 'Case study title two', outcome: 'One-line outcome goes here, plain and specific.', role: 'Role placeholder', tracks: ['learning-design', 'engineering'] },
  { title: 'Case study title three', outcome: 'One-line outcome goes here, plain and specific.', role: 'Role placeholder', tracks: ['teaching'] },
  { title: 'Case study title four', outcome: 'One-line outcome goes here, plain and specific.', role: 'Role placeholder', tracks: ['learning-design', 'teaching', 'design-ux'] },
  { title: 'Case study title five', outcome: 'One-line outcome goes here, plain and specific.', role: 'Role placeholder', tracks: ['engineering'] },
  { title: 'Case study title six', outcome: 'One-line outcome goes here, plain and specific.', role: 'Role placeholder', tracks: ['teaching'] },
];

export const identityLine =
  'Developer of curriculum, software and learning experiences for learners like you.';

export const filters = [
  { id: 'all', label: 'All' },
  { id: 'learning-design', label: 'Learning Design' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design-ux', label: 'Design & UX' },
] as const;
