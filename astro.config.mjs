import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// CROLANE site configuration.
// `site` is used for canonical URLs, the sitemap and social metadata.
// It can be overridden at build time with the SITE_URL environment variable.
const site = process.env.SITE_URL?.trim() || 'https://crolane.in';

export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    // Astro validates the Host / X-Forwarded-Host header against this list.
    // An empty list (the default) makes every request resolve to
    // http://localhost, which breaks the cross-origin form check that
    // protects POST /api/contact. Keep every host the site is served from.
    checkOrigin: true,
    allowedDomains: [
      { protocol: 'https', hostname: 'crolane.in' },
      { protocol: 'http', hostname: 'crolane.in' },
      { protocol: 'https', hostname: 'www.crolane.in' },
      { protocol: 'http', hostname: 'www.crolane.in' },
      { protocol: 'https', hostname: '*.e2b.app' },
      { protocol: 'http', hostname: '*.e2b.app' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  server: {
    host: true,
    port: 4321,
  },
  preview: {
    host: true,
    port: 4321,
  },
});
