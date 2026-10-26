# CROLANE

Marketing website for **CROLANE**: conversion rate optimization, experimentation,
analytics implementation, practical AI automation, AI voice agents and Shopify
shopping experience audits.

- 14 pages: home, services overview, 7 individual service pages, about, contact,
  privacy, terms and a custom 404
- Interactive, clearly labelled illustrative demos (A/B testing lab, analytics
  dashboard, tracking journey, workflow visual, voice agent, Shopify journey)
- Working contact form that emails enquiries to **admin@crolane.in** via SMTP
- Full SEO: unique titles/descriptions, canonical URLs, Open Graph/Twitter
  cards, JSON-LD, sitemap and robots.txt
- Built for accessibility (semantic landmarks, keyboard-friendly menus,
  `prefers-reduced-motion` support, WebGL with a poster fallback) and
  performance (prerendered pages, self-hosted fonts, minimal JS)

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 5 (static-prerendered pages + one dynamic API route) |
| Server | `@astrojs/node` standalone adapter (Node >= 22) |
| Styling | Tailwind CSS 4 (Vite plugin), custom design tokens |
| Motion | GSAP, Lenis, Three.js (hero scene, progressive enhancement) |
| Email | Nodemailer over SMTP (credentials from env vars only) |

## Local development

```bash
npm install
cp .env.example .env   # fill in SMTP_* locally if you want real mail
npm run dev            # http://localhost:4321
```

For local work without an SMTP server you can set `MAIL_DEV_LOG=true` in
`.env`: submissions are logged to the dev console instead of being sent.
Never enable that in production.

Production build and preview:

```bash
npm run build          # outputs dist/ (dist/client assets + dist/server)
npm run preview        # astro preview
npm run start          # node ./dist/server/entry.mjs (what production runs)
```

Quality checks:

```bash
npm run check          # astro check (types + templates)
npx tsc --noEmit       # strict TypeScript
npm run test:links     # crawls dist HTML: internal links, anchors, assets
npm run test:mail      # boots the built server against a mock SMTP server
                       # and runs 21 end-to-end contact-pipeline checks
npm run og             # regenerates public/images/og-default.png
```

## Environment variables

All secrets live in environment variables. They are **never** committed and
never sent to the browser. See `.env.example` for the full list.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | build time | Public origin, e.g. `https://crolane.in`. Used for canonical URLs, sitemap and OG tags. |
| `SMTP_HOST` | yes (prod) | SMTP server hostname from your mailbox provider. |
| `SMTP_PORT` | yes (prod) | Usually `465` (SSL) or `587` (STARTTLS). |
| `SMTP_SECURE` | no | `true` for port 465. Defaults to `true` when port is 465. |
| `SMTP_USER` | yes (prod) | Mailbox username (usually the full email address). |
| `SMTP_PASS` | yes (prod) | Mailbox password. Secret. |
| `MAIL_FROM` | no | Sender identity. Must be the authenticated mailbox or an authorised sender. |
| `MAIL_TO` | no | Where enquiries go. Defaults to `admin@crolane.in`. |
| `ALLOWED_ORIGINS` | no | Extra comma-separated browser origins allowed to POST to `/api/contact`. Same-origin always works. |
| `RATE_LIMIT_SKIP` | no | Comma-separated IPs/CIDRs exempt from the contact rate limiter. |
| `MAIL_DEV_LOG` | dev only | Log submissions instead of sending. Ignored when `NODE_ENV=production`. |

If SMTP is not configured, `/api/contact` returns `503 SMTP_NOT_CONFIGURED`
and the form tells the visitor to email `admin@crolane.in` directly. The site
never shows a fake success message: success is only reported after the SMTP
server accepts the message.

## Deploying to Hostinger Business (from GitHub)

Hostinger Business web hosting runs Node.js apps and can deploy them directly
from a GitHub repository, rebuilding automatically on push. Node 18, 20, 22
and 24 are offered; this project needs **Node 22**.

1. **Push this repository to GitHub** (already done for the production repo).
2. In **hPanel**, open *Websites → Add Website → Node.js app* (or *Dashboard →
   Node.js → Create application* on the Business plan).
3. Connect the GitHub repository and select the production branch.
4. Configure the app:
   - **Node version:** 22
   - **Install/build command:** `npm ci && npm run build`
   - **Start command:** `npm run start` (runs `node ./dist/server/entry.mjs`)
   - **Root directory:** repository root
5. In the app's **Environment variables** section, set every variable from the
   table above. At minimum: `SITE_URL`, `SMTP_HOST`, `SMTP_PORT`,
   `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`. Do not upload a `.env` file.
6. Point the domain (e.g. `crolane.in`) at the app and enable the free SSL
   certificate in hPanel, then deploy. Hostinger rebuilds and restarts the app
   on every push to the connected branch.

### Email setup on Hostinger

1. In hPanel go to **Emails** and create the mailboxes you need, at minimum
   the mailbox used as `SMTP_USER` (for example `no-reply@crolane.in`) and
   `admin@crolane.in`, which receives enquiries.
2. Open the mailbox's *Connect devices / SMTP settings* in hPanel and copy the
   outgoing server host and port into `SMTP_HOST` / `SMTP_PORT`.
3. Set `MAIL_FROM` to the authenticated mailbox. Sending "from" an address you
   do not own will be rejected or flagged as spam.
4. Add SPF, DKIM and DMARC records for the domain in hPanel (Emails →
   deliverability settings) so enquiry emails are not treated as junk.
5. After deploying, submit the contact form once with a real enquiry and
   confirm delivery to `admin@crolane.in` before announcing the site.

### Important notes

- `security.allowedDomains` in `astro.config.mjs` lists every host the site is
  served from (`crolane.in`, `www.crolane.in`, `*.e2b.app` previews, localhost).
  Astro validates the `Host`/`X-Forwarded-Host` header against this list; if
  you add a new domain or hostname, add it there too, otherwise pages still
  render but the contact form's origin check will reject submissions with 403.
- The contact API applies validation, a honeypot, a minimum fill-time check
  and per-IP rate limiting. Behind Hostinger's proxy the real client IP comes
  from `X-Forwarded-For`, which the app already handles.
- Pages are prerendered at build time; only `POST /api/contact` runs on the
  server. If you change `SITE_URL`, rebuild so canonical and sitemap URLs
  update.

## Search engines and AI discovery (SEO / GEO)

Already built in, no plugin needed:

- Canonical URL, meta description, Open Graph and Twitter cards on every page.
- Structured data (schema.org JSON-LD): Organization and WebSite on all pages,
  Service + BreadcrumbList + FAQPage on every service page, ItemList + FAQPage
  on the home and services pages.
- `/sitemap.xml` with priorities, `/robots.txt` that explicitly welcomes the
  major search and AI crawlers (Google, Bing, GPTBot, ClaudeBot, PerplexityBot
  and others), and `/llms.txt`, a plain-language map of the site for AI answer
  engines, generated from the same service data as the pages.

### Verify in Google Search Console and Bing Webmaster Tools

1. Add the property `https://crolane.in` in Google Search Console (and the same
   in Bing Webmaster Tools).
2. Choose the "HTML tag" verification method and copy only the `content` code
   from the tag it shows you.
3. In hPanel environment variables set `PUBLIC_GOOGLE_SITE_VERIFICATION` (or
   `PUBLIC_BING_SITE_VERIFICATION` for Bing) to that code, then redeploy. The
   matching meta tag is printed in every page head automatically.
4. Back in the console, click Verify, then submit the sitemap:
   `https://crolane.in/sitemap.xml`.

Ranking itself is earned over time: consoles show indexing and queries, and
fresh, genuinely helpful content plus real mentions of the business elsewhere
are what move a site up. There is no setting that guarantees position one.

## Project layout

```
src/
  config/        site + services data (single source of truth)
  layouts/       Base.astro (SEO head, header, footer)
  components/    homepage sections, service-page system, forms
  scripts/       vanilla TS interactivity (motion, demos, form)
  lib/mail.ts    SMTP delivery for contact enquiries
  pages/         routes; pages/api/contact.ts is the only dynamic route
public/images/   artwork and product imagery
scripts/         check-links.mjs, test-mail.mjs, build-og.mjs
```

## Content policy

No testimonials, client logos, metrics or results are shown anywhere on this
site, because none may be invented. Every chart, metric, heatmap and
conversation in the demos is labelled illustrative, and the demos run entirely
in the browser on fictional data. There are exactly seven services; do not add
more without updating `src/config/services.ts`, the navigation and this file
together.

## License

Proprietary. © 2026 CROLANE. All rights reserved.
