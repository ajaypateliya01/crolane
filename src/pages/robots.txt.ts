import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const prerender = true;

export const GET: APIRoute = () => {
  const aiAgents = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'cohere-ai',
    'Meta-ExternalAgent',
    'YouBot',
  ];
  const aiRules = aiAgents.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n');
  const body = `User-agent: *
Allow: /

${aiRules}

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
