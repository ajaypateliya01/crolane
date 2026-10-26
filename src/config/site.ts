export const SITE = {
  name: 'CROLANE',
  legalName: 'CROLANE',
  tagline: 'Conversion optimization, measurement and practical AI',
  email: 'admin@crolane.in',
  url: (process.env.SITE_URL?.trim() || 'https://crolane.in').replace(/\/$/, ''),
  description:
    'CROLANE helps businesses improve conversion rates with evidence: CRO audits, A/B testing, GA4 and tag management, behaviour analytics, practical AI automation, AI voice agents and Shopify shopping experience audits.',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;
