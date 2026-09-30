import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    outcome: z.string(),
    role: z.string(),
    org: z.string(),
    dates: z.string(),
    audience: z.string(),
    tools: z.array(z.string()).default([]),
    tracks: z.array(z.enum(['learning-design', 'teaching', 'engineering', 'design-ux'])).default([]),
    cover: z.string().optional(),
    confidential: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    headshot: image().optional(),
    headshotAlt: z.string().optional(),
  }),
});

// One file per career moment in src/content/timeline/. Sorted by `order` (1 = earliest).
const timeline = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/timeline' }),
  schema: ({ image }) => z.object({
    label: z.string().optional(),     // short tag shown first, e.g. "Design"
    title: z.string(),
    period: z.string(),               // e.g. "2019 to 2021", shown as a label
    org: z.string().optional(),
    order: z.number(),
    skills: z.array(z.string()).default([]),
    link: z.object({ label: z.string(), url: z.string() }).optional(), // shown only once url is filled in
    image: image().optional(),        // optional; put files in src/assets/timeline/
    imageAlt: z.string().optional(),
  }),
});

export const collections = { work, pages, timeline };
