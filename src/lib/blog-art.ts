import type { IllKey } from './iso';

/** Which isometric illustration represents each blog category. */
export const CATEGORY_ART: Record<string, IllKey> = {
  'ai-agents': 'chip',
  workflows: 'flow',
  'voice-ai': 'voice',
  cro: 'ab',
  analytics: 'ga4',
  shopify: 'shop',
};
export const artFor = (category?: string): IllKey => CATEGORY_ART[category || ''] || 'audit';
