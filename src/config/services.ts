import bfcm from '../content/settings/bfcm.json';

export type Service = {
  id: string;
  num: string;
  slug: string;
  path: string;
  title: string;
  navTitle: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  accent: string;
  accentSoft: string;
  art: string;
};

/**
 * CROLANE service categories.
 * accent values are CSS custom properties defined in the design system.
 */
export const SERVICES: Service[] = [
  {
    id: 'cro-audit',
    num: '01',
    slug: 'cro-audit',
    path: '/services/cro-audit/',
    title: 'CRO Audit and Conversion Optimization',
    navTitle: 'CRO Audit & Optimization',
    short:
      'A structured review of your customer journey that finds friction, prioritises opportunities and turns findings into a practical action plan.',
    metaTitle: 'Shopify & E-commerce CRO Audit With Fixes Shipped | CROLANE',
    metaDescription:
      'Developer-led CRO audit for Shopify and e-commerce stores. Find what stops visitors buying, then get the fixes built and shipped. Fixed price from $599.',
    accent: 'var(--color-amber)',
    accentSoft: '#f7ead6',
    art: '/images/art-cro-audit.jpg',
  },
  {
    id: 'ab-testing',
    num: '02',
    slug: 'ab-testing',
    path: '/services/ab-testing/',
    title: 'A/B Testing and Experimentation Services',
    navTitle: 'A/B Testing & Experimentation',
    short:
      'Plan and run experiments that compare two experiences, measure real behaviour and replace opinion with evidence.',
    metaTitle: 'Experimentation & A/B Testing Services for E-commerce | CROLANE',
    metaDescription:
      'Experimentation services from a developer who builds A/B tests daily: single tests from $999 or a continuous testing program in VWO, Convert or Shoplift, with honest read-outs.',
    accent: 'var(--color-indigo)',
    accentSoft: '#f8e9e1',
    art: '/images/art-ab-testing.jpg',
  },
  {
    id: 'ga4-tag-manager',
    num: '03',
    slug: 'ga4-tag-manager',
    path: '/services/ga4-tag-manager/',
    title: 'GA4, Google Tag Manager and Analytics Implementation',
    navTitle: 'GA4 & Tag Management',
    short:
      'Clean analytics implementation with GA4 and Google Tag Manager, so events, conversions and reports reflect what actually happens.',
    metaTitle: 'GA4 & Google Tag Manager Setup and Fixes for Shopify | CROLANE',
    metaDescription:
      'GA4 and GTM setup or repair: purchase and add_to_cart events, duplicate conversions, consent and clean reporting. Fixed price from $349.',
    accent: 'var(--color-azure)',
    accentSoft: '#f1efe9',
    art: '/images/art-analytics.jpg',
  },
  {
    id: 'conversion-tracking',
    num: '04',
    slug: 'conversion-tracking',
    path: '/services/conversion-tracking/',
    title: 'Conversion Tracking and Behaviour Analytics',
    navTitle: 'Conversion Tracking & Behaviour',
    short:
      'Follow the path from first visit to meaningful action with reliable conversion tracking and behaviour analytics.',
    metaTitle: 'Conversion Tracking & Heatmap Setup (GA4, Meta, Hotjar) | CROLANE',
    metaDescription:
      'Conversion tracking you can trust: GA4 events, Meta pixel and CAPI checks, Hotjar or Clarity heatmaps and funnel reports. From $349.',
    accent: 'var(--color-coral)',
    accentSoft: '#fbe6df',
    art: '/images/art-tracking.jpg',
  },
  {
    id: 'ai-automation',
    num: '05',
    slug: 'ai-automation',
    path: '/services/ai-automation/',
    title: 'AI Agentic Workflows and Automation',
    navTitle: 'AI Agentic Workflows',
    short:
      'Custom AI agent workflows in n8n and similar tools that read, sort, draft and route work, with human checkpoints where it matters.',
    metaTitle: 'AI Agentic Workflows & n8n Automation for Businesses | CROLANE',
    metaDescription:
      'Custom AI agent workflows built in n8n: lead triage, document extraction, drafting and routing, with logging and human review. Fixed price from $499 per workflow.',
    accent: 'var(--color-emerald)',
    accentSoft: '#dff2ea',
    art: '/images/art-automation.jpg',
  },
  {
    id: 'ai-voice-agents',
    num: '06',
    slug: 'ai-voice-agents',
    path: '/services/ai-voice-agents/',
    title: 'AI Voice Agents and Virtual Receptionists',
    navTitle: 'AI Voice Agents',
    short:
      'A voice agent that answers routine questions from approved information and captures enquiries, including outside working hours.',
    metaTitle: 'AI Voice Receptionist & Voice Agents for Businesses | CROLANE',
    metaDescription:
      'An AI receptionist that answers calls 24/7, handles routine questions, captures leads and books appointments. Built on Vapi or Retell. Setup from $499.',
    accent: 'var(--color-violet)',
    accentSoft: '#f6ece4',
    art: '/images/art-voice.jpg',
  },
  {
    id: 'ai-agent-audit',
    num: '07',
    slug: 'ai-agent-audit',
    path: '/services/ai-agent-audit/',
    title: 'AI Agent and Automation Audit',
    navTitle: 'AI Agent Audit',
    short:
      'A review of the AI agents and automations you already run: what they cost, where they fail, what is exposed, and how to make them cheaper and more reliable.',
    metaTitle: 'AI Agent Audit: Cost, Reliability & Security Review | CROLANE',
    metaDescription:
      'Audit your AI agents, chatbots and n8n or Make automations: token and API spend, failure rates, prompt and data risks, and a prioritised fix plan. From $499.',
    accent: 'var(--color-indigo)',
    accentSoft: '#f8e9e1',
    art: '/images/art-analytics.jpg',
  },
  {
    id: 'shopify-audits',
    num: '08',
    slug: 'shopify-audits',
    path: '/services/shopify-audits/',
    title: 'Shopify Commerce and AI Shopping Experience Audits',
    navTitle: 'Shopify Experience Audits',
    short:
      'Storefront audits focused on product page clarity, mobile shopping usability, product discovery and AI assisted recommendations.',
    metaTitle: 'Shopify Store Audit: Product Page, Cart & Mobile UX | CROLANE',
    metaDescription:
      'A Shopify store audit focused on product pages, cart, mobile UX and site search, with fixes you can ship this week. From $599.',
    accent: 'var(--color-rose)',
    accentSoft: '#fbe3ea',
    art: '/images/art-shopify.jpg',
  },
];

export const serviceBySlug = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

/** Service selector options for the contact form (the approved service areas). */
export const SERVICE_OPTIONS = [
  { value: 'free-mini-audit', label: 'Free 3-leak video audit' },
  ...bfcm.packages.map((p) => ({
    value: `bfcm-${p.id}`,
    label: `BFCM: ${p.name} ($${p.price})`,
  })),
  ...SERVICES.map((s) => ({
    value: s.id,
    label: s.title,
  })),
];
