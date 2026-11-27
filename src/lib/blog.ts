import { getCollection } from 'astro:content';

export const CATEGORY_LABELS: Record<string, string> = {
  'ai-agents': 'AI agents',
  workflows: 'Workflows & automation',
  'voice-ai': 'Voice AI',
  cro: 'CRO & A/B testing',
  analytics: 'Analytics',
  shopify: 'Shopify',
};

/** Published posts, newest first. Drafts are hidden in production builds. */
export async function getPosts() {
  const posts = await getCollection('posts', (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Rough reading time from the raw markdoc body. */
export const readMins = (body = '') => Math.max(1, Math.round(body.split(/\s+/).length / 220));
