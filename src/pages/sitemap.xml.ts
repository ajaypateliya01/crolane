import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { SERVICES } from '../config/services';

export const prerender = true;

const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services/', priority: '0.9', changefreq: 'weekly' },
  { path: '/about/', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact/', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy/', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms/', priority: '0.3', changefreq: 'yearly' },
];
const lastmod = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = () => {
  const routes = [
    ...STATIC_ROUTES,
    ...SERVICES.map((s) => ({ path: s.path, priority: '0.8', changefreq: 'monthly' })),
  ];
  const urls = routes.map(
    (route) => `  <url>
    <loc>${SITE.url}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
