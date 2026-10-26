import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { SERVICES } from '../config/services';

export const prerender = true;

const STATIC_ROUTES = ['/', '/services/', '/about/', '/contact/', '/privacy/', '/terms/'];
const lastmod = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = () => {
  const urls = [...STATIC_ROUTES, ...SERVICES.map((s) => s.path)].map(
    (path) => `  <url>
    <loc>${SITE.url}${path}</loc>
    <lastmod>${lastmod}</lastmod>
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
