import { config, fields, collection, singleton } from '@keystatic/core';

// Admin panel at /keystatic.
// Local dev edits files on disk; production commits edits to GitHub,
// which triggers the Hostinger rebuild.
const storage = import.meta.env.PROD
  ? ({ kind: 'github', repo: { owner: 'ajaypateliya01', name: 'crolane' } } as const)
  : ({ kind: 'local' } as const);

const uploads = {
  directory: 'public/images/uploads',
  publicPath: '/images/uploads/',
};

export default config({
  storage,
  ui: {
    brand: { name: 'CROLANE Admin' },
    navigation: {
      'Offers & pricing': ['bfcm', 'pricing'],
      'Site': ['settings', 'home'],
      'Content': ['posts', 'reviews'],
    },
  },
  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        offerBar: fields.object(
          {
            enabled: fields.checkbox({ label: 'Show offer bar on every page', defaultValue: true }),
            text: fields.text({ label: 'Offer bar text' }),
            linkLabel: fields.text({ label: 'Link label' }),
            href: fields.text({ label: 'Link URL', defaultValue: '/bfcm/' }),
          },
          { label: 'Top offer bar' },
        ),
        stickyCta: fields.object(
          {
            enabled: fields.checkbox({ label: 'Show sticky mobile CTA', defaultValue: true }),
            label: fields.text({ label: 'Button label' }),
            href: fields.text({ label: 'Button URL', defaultValue: '/bfcm/' }),
          },
          { label: 'Sticky mobile CTA' },
        ),
        founder: fields.object(
          {
            name: fields.text({ label: 'Name' }),
            role: fields.text({ label: 'Role' }),
            bio: fields.text({ label: 'Short bio', multiline: true }),
            linkedin: fields.url({ label: 'LinkedIn URL' }),
            photo: fields.image({ label: 'Photo (square, at least 400px)', ...uploads }),
          },
          { label: 'Founder' },
        ),
        proofPoints: fields.array(fields.text({ label: 'Proof point' }), {
          label: 'Proof points (real facts only)',
          itemLabel: (p) => p.value,
        }),
      },
    }),
    home: singleton({
      label: 'Homepage',
      path: 'src/content/settings/home',
      format: { data: 'json' },
      schema: {
        eyebrow: fields.text({ label: 'Eyebrow' }),
        headline: fields.text({ label: 'Headline' }),
        highlight: fields.text({ label: 'Highlighted word in headline (italic gradient)' }),
        lede: fields.text({ label: 'Sub headline', multiline: true }),
        primaryLabel: fields.text({ label: 'Primary button label' }),
        primaryHref: fields.text({ label: 'Primary button URL' }),
        secondaryLabel: fields.text({ label: 'Secondary button label' }),
        secondaryHref: fields.text({ label: 'Secondary button URL' }),
      },
    }),
    bfcm: singleton({
      label: 'BFCM offer page',
      path: 'src/content/settings/bfcm',
      format: { data: 'json' },
      schema: {
        enabled: fields.checkbox({ label: 'Offer is live', defaultValue: true }),
        eyebrow: fields.text({ label: 'Eyebrow' }),
        headline: fields.text({ label: 'Headline' }),
        lede: fields.text({ label: 'Sub headline', multiline: true }),
        deadline: fields.text({
          label: 'Deadline (ISO, e.g. 2026-11-30T04:59:00Z)',
          description: 'Used for the countdown. 2026-11-30T04:59:00Z = Sun 29 Nov 11:59 PM EST.',
        }),
        deadlineLabel: fields.text({ label: 'Deadline text' }),
        slots: fields.integer({ label: 'Store slots available', defaultValue: 5 }),
        packages: fields.array(
          fields.object({
            id: fields.text({ label: 'ID (no spaces)' }),
            name: fields.text({ label: 'Name' }),
            price: fields.integer({ label: 'Offer price (USD)' }),
            regularPrice: fields.integer({ label: 'Regular price from Dec 1 (USD)' }),
            badge: fields.text({ label: 'Badge (optional)' }),
            highlight: fields.checkbox({ label: 'Highlight this card' }),
            summary: fields.text({ label: 'One-line summary' }),
            delivery: fields.text({ label: 'Delivery' }),
            features: fields.array(fields.text({ label: 'Feature' }), {
              label: 'Included',
              itemLabel: (p) => p.value,
            }),
          }),
          { label: 'Packages', itemLabel: (p) => `${p.fields.name.value} · $${p.fields.price.value}` },
        ),
        addons: fields.array(
          fields.object({
            name: fields.text({ label: 'Add-on' }),
            price: fields.text({ label: 'Price text' }),
          }),
          { label: 'Add-ons', itemLabel: (p) => p.fields.name.value },
        ),
        guarantee: fields.text({ label: 'Guarantee', multiline: true }),
        faqs: fields.array(
          fields.object({
            q: fields.text({ label: 'Question' }),
            a: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQs', itemLabel: (p) => p.fields.q.value },
        ),
      },
    }),
    pricing: singleton({
      label: 'Pricing page and service prices',
      path: 'src/content/settings/pricing',
      format: { data: 'json' },
      schema: {
        packages: fields.array(
          fields.object({
            id: fields.text({ label: 'ID (no spaces)' }),
            service: fields.text({ label: 'Service ID for the contact form (e.g. cro-audit)' }),
            name: fields.text({ label: 'Name' }),
            price: fields.integer({ label: 'Price (USD)' }),
            badge: fields.text({ label: 'Badge (optional)' }),
            highlight: fields.checkbox({ label: 'Highlight this card' }),
            summary: fields.text({ label: 'One-line summary' }),
            delivery: fields.text({ label: 'Delivery' }),
            features: fields.array(fields.text({ label: 'Feature' }), {
              label: 'Included',
              itemLabel: (p) => p.value,
            }),
          }),
          {
            label: 'Everyday sprint packages (shown on /pricing/ when BFCM is off)',
            itemLabel: (p) => `${p.fields.name.value} · $${p.fields.price.value}`,
          },
        ),
        services: fields.array(
          fields.object({
            id: fields.select({
              label: 'Service',
              defaultValue: 'cro-audit',
              options: [
                { label: 'CRO Audit', value: 'cro-audit' },
                { label: 'A/B Testing', value: 'ab-testing' },
                { label: 'GA4 & GTM', value: 'ga4-tag-manager' },
                { label: 'Conversion Tracking', value: 'conversion-tracking' },
                { label: 'AI Automation', value: 'ai-automation' },
                { label: 'AI Voice Agents', value: 'ai-voice-agents' },
                { label: 'AI Agent Audit', value: 'ai-agent-audit' },
                { label: 'Shopify Audits', value: 'shopify-audits' },
              ],
            }),
            from: fields.text({ label: 'Price text, e.g. "From $599"' }),
            note: fields.text({ label: 'Small note, e.g. "fixed price, 48 hr delivery"' }),
          }),
          { label: 'Prices', itemLabel: (p) => `${p.fields.id.value}: ${p.fields.from.value}` },
        ),
      },
    }),
  },
  collections: {
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'SEO description (150-160 chars)', multiline: true }),
        date: fields.date({ label: 'Publish date', defaultValue: { kind: 'today' } }),
        category: fields.select({
          label: 'Category',
          defaultValue: 'ai-agents',
          options: [
            { label: 'AI agents', value: 'ai-agents' },
            { label: 'Workflows & automation', value: 'workflows' },
            { label: 'Voice AI', value: 'voice-ai' },
            { label: 'CRO & A/B testing', value: 'cro' },
            { label: 'Analytics (GA4/GTM)', value: 'analytics' },
            { label: 'Shopify', value: 'shopify' },
          ],
        }),
        cover: fields.image({ label: 'Cover image (optional)', ...uploads }),
        draft: fields.checkbox({ label: 'Draft (hidden from site)', defaultValue: false }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
    reviews: collection({
      label: 'Client reviews (real only)',
      slugField: 'name',
      path: 'src/content/reviews/*',
      format: { data: 'json' },
      columns: ['name', 'company'],
      schema: {
        name: fields.slug({ name: { label: 'Client name' } }),
        role: fields.text({ label: 'Role' }),
        company: fields.text({ label: 'Company' }),
        quote: fields.text({ label: 'Review text (exact words)', multiline: true }),
        source: fields.select({
          label: 'Where it was given',
          defaultValue: 'linkedin',
          options: [
            { label: 'LinkedIn recommendation', value: 'linkedin' },
            { label: 'Upwork', value: 'upwork' },
            { label: 'Clutch', value: 'clutch' },
            { label: 'Email (with permission)', value: 'email' },
          ],
        }),
        sourceUrl: fields.url({ label: 'Link to the original (recommended)' }),
        permission: fields.checkbox({
          label: 'Client agreed to be quoted on the site',
          description: 'Reviews only show on the site when this is ticked.',
          defaultValue: false,
        }),
      },
    }),
  },
});
