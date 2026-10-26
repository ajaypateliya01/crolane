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
    metaTitle: 'CRO Audit and Conversion Optimization Services | CROLANE',
    metaDescription:
      'A structured conversion audit of your landing pages, product journey and checkout. We find friction, prioritise opportunities and plan evidence based improvements.',
    accent: 'var(--color-amber)',
    accentSoft: '#f7ead6',
    art: '/images/art-cro-audit.jpg',
  },
  {
    id: 'ab-testing',
    num: '02',
    slug: 'ab-testing',
    path: '/services/ab-testing/',
    title: 'A/B Testing and Experimentation',
    navTitle: 'A/B Testing & Experimentation',
    short:
      'Plan and run experiments that compare two experiences, measure real behaviour and replace opinion with evidence.',
    metaTitle: 'A/B Testing and Experimentation Services | CROLANE',
    metaDescription:
      'Hypothesis driven A/B testing and experimentation: test design, traffic splitting, measurement, read outs and practical next steps.',
    accent: 'var(--color-indigo)',
    accentSoft: '#e6e8fe',
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
    metaTitle: 'GA4 and Google Tag Manager Implementation | CROLANE',
    metaDescription:
      'GA4 and Google Tag Manager implementation: measurement planning, event design, tag configuration, validation and dependable reporting.',
    accent: 'var(--color-azure)',
    accentSoft: '#e0eafc',
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
    metaTitle: 'Conversion Tracking and Behaviour Analytics | CROLANE',
    metaDescription:
      'Conversion tracking and behaviour analytics that map funnels, events and drop off points, so you know where the journey loses people.',
    accent: 'var(--color-coral)',
    accentSoft: '#fbe6df',
    art: '/images/art-tracking.jpg',
  },
  {
    id: 'ai-automation',
    num: '05',
    slug: 'ai-automation',
    path: '/services/ai-automation/',
    title: 'AI Systems and Workflow Automation',
    navTitle: 'AI Systems & Automation',
    short:
      'Practical, reviewable workflows that reduce repetitive handling of form submissions, documents and internal tasks.',
    metaTitle: 'AI Systems and Workflow Automation Services | CROLANE',
    metaDescription:
      'Practical AI workflow automation: classification, drafting, routing, human checkpoints and execution logging built around your real process.',
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
    metaTitle: 'AI Voice Agents and Virtual Receptionists | CROLANE',
    metaDescription:
      'AI voice agents that answer incoming calls, handle routine questions from approved information, capture enquiries and share out of hours information.',
    accent: 'var(--color-violet)',
    accentSoft: '#ebe4ff',
    art: '/images/art-voice.jpg',
  },
  {
    id: 'shopify-audits',
    num: '07',
    slug: 'shopify-audits',
    path: '/services/shopify-audits/',
    title: 'Shopify Commerce and AI Shopping Experience Audits',
    navTitle: 'Shopify Experience Audits',
    short:
      'Storefront audits focused on product page clarity, mobile shopping usability, product discovery and AI assisted recommendations.',
    metaTitle: 'Shopify Commerce and AI Shopping Experience Audits | CROLANE',
    metaDescription:
      'Shopify storefront audits covering product page clarity, mobile shopping usability, cart and checkout friction, discovery and AI assisted recommendations.',
    accent: 'var(--color-rose)',
    accentSoft: '#fbe3ea',
    art: '/images/art-shopify.jpg',
  },
];

export const serviceBySlug = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

/** Service selector options for the contact form (the approved service areas). */
export const SERVICE_OPTIONS = SERVICES.map((s) => ({
  value: s.id,
  label: s.title,
}));
