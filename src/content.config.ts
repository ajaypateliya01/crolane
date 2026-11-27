import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    category: z.string().default('ai-agents'),
    cover: z.string().nullable().optional(),
    draft: z.boolean().default(false),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/reviews' }),
  schema: z.object({
    name: z.string(),
    role: z.string().default(''),
    company: z.string().default(''),
    quote: z.string(),
    source: z.string().default('linkedin'),
    sourceUrl: z.string().nullable().optional(),
    permission: z.boolean().default(false),
  }),
});

export const collections = { posts, reviews };
