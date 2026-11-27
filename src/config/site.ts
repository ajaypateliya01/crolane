export const SITE = {
  name: 'CROLANE',
  legalName: 'CROLANE',
  tagline: 'Conversion optimization, measurement and practical AI',
  email: 'admin@crolane.in',
  url: (process.env.SITE_URL?.trim() || 'https://crolane.in').replace(/\/$/, ''),
  description:
    'Developer-led CRO for Shopify and e-commerce brands: audits with fixes shipped, A/B tests, GA4 and GTM tracking, plus AI voice receptionists and workflow automation.',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;
