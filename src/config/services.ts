import pricing from '../content/settings/pricing.json';
import bfcm from '../content/settings/bfcm.json';
import type { IllKey } from '../lib/iso';

export type DemoKind = 'funnel' | 'ab' | 'ga4' | 'tags' | 'voice' | 'flow' | 'cost' | 'dash' | 'result';
export type Faq = { q: string; a: string };
export type Service = {
  id: string; slug: string; path: string; name: string; navTitle: string; title: string; grp: string;
  kw: string; metaTitle: string; metaDescription: string; short: string; h1: string; lede: string;
  ill: IllKey; demo: DemoKind; get: string[][]; fix: string[]; faqs: Faq[];
};

export const GROUPS = ['CRO and testing', 'Analytics', 'AI services'] as const;

/** All service content lives here, so pages stay thin templates. */
export const SERVICES: Service[] = [
  {
    "id": "cro-audit",
    "name": "CRO Audit",
    "navTitle": "CRO Audit",
    "grp": "CRO and testing",
    "ill": "audit",
    "demo": "funnel",
    "title": "CRO Audit and Conversion Optimization",
    "kw": "CRO audit service",
    "metaTitle": "CRO Audit for Shopify and Ecommerce Stores | CROLANE",
    "metaDescription": "A developer-led CRO audit that finds where your store loses buyers, then ships the fixes. Funnel, product page and checkout review with a ranked plan.",
    "short": "A full review of your funnel that pinpoints where buyers drop off, then ships the top fixes.",
    "h1": "Find the exact steps where your store loses buyers",
    "lede": "A review of your funnel, product pages, cart and checkout using GA4, heatmaps and session recordings. It ends in fixes shipped on a duplicate theme, not a 60 page PDF.",
    "get": [
      [
        "Funnel analysis",
        "Where visitors drop and how much revenue each step leaks."
      ],
      [
        "Page by page review",
        "Home, collection, product, cart and checkout, on mobile first."
      ],
      [
        "Ranked fix list",
        "Every issue scored by impact and effort, with the reasoning shown."
      ],
      [
        "Fixes shipped",
        "The top fixes built on a duplicate theme and published after your OK."
      ]
    ],
    "fix": [
      "Product pages that do not answer buying questions",
      "Checkout steps that add friction on mobile",
      "Weak trust signals near the add to cart button",
      "Slow pages that waste paid traffic"
    ],
    "slug": "cro-audit",
    "path": "/services/cro-audit/",
    "faqs": [
      {
        "q": "What do you need to run a CRO audit?",
        "a": "Access to the live experience, your analytics if you have them, and an hour of context from someone who knows the business. Session recordings, heatmaps and support tickets help but are not required."
      },
      {
        "q": "Do you redesign our website?",
        "a": "An audit does not automatically mean a redesign. Most findings are specific improvements: hierarchy, copy, sequencing, forms, trust, mobile usability. If a redesign is genuinely the right answer, the audit will show why."
      },
      {
        "q": "How are the findings prioritised?",
        "a": "By estimated impact against estimated effort, with the reasoning shown for each item. You get the priority logic, not just a ranked list, so your team can challenge it."
      },
      {
        "q": "Will you implement the recommendations?",
        "a": "Yes. Every audit package includes the top fixes built and shipped on a duplicate theme and published after your approval. Larger changes get a fixed quote, or the findings can go to your own developer with clear notes."
      }
    ]
  },
  {
    "id": "ab-testing",
    "name": "A/B Testing Program",
    "navTitle": "A/B Testing",
    "grp": "CRO and testing",
    "ill": "ab",
    "demo": "ab",
    "title": "A/B Testing and Experimentation Services",
    "kw": "A/B testing agency",
    "metaTitle": "A/B Testing Services for Ecommerce Brands | CROLANE",
    "metaDescription": "A/B tests built and run by a developer who codes tests daily. Research backed ideas, clean code in VWO, Convert or Shoplift, and honest read-outs.",
    "short": "Research backed tests launched every week, with clean code and read-outs you can trust.",
    "h1": "A/B tests that prove what lifts your revenue",
    "lede": "Hypotheses from real data, variants coded and QA tested on every major device, and plain read-outs that say keep, drop or iterate. In VWO, Convert, Optimizely or Shoplift.",
    "get": [
      [
        "Test roadmap",
        "Ideas from data and research, ranked by expected impact."
      ],
      [
        "Build and QA",
        "Variants coded and checked on Safari, Chrome and small screens."
      ],
      [
        "Launch and monitor",
        "Tests run to a proper sample size, with no early peeking."
      ],
      [
        "Clear read-outs",
        "Winner, lift, confidence and what we learned, on one page."
      ]
    ],
    "fix": [
      "Tests that end too early and crown false winners",
      "Variants that break on Safari or small screens",
      "No clear plan for what to test next",
      "Results nobody on the team trusts"
    ],
    "slug": "ab-testing",
    "path": "/services/ab-testing/",
    "faqs": [
      {
        "q": "Do you run continuous experimentation programs?",
        "a": "Yes. Besides single tests, CROLANE runs ongoing A/B test programs: a prioritised backlog of hypotheses, one or more tests live at a time, documented read-outs and a monthly summary of what was learned. Most programs launch one test a week. Pace depends on your traffic, so a three-month plan is recommended."
      },
      {
        "q": "Do you build tests white-label for agencies?",
        "a": "Yes. Agencies send the brief and design, and the test comes back built, QA-tested and ready to launch in your client's tool, under your name."
      },
      {
        "q": "What is the difference between an A/B testing agency and experimentation services?",
        "a": "They are mostly the same thing. \"Experimentation\" usually means a repeatable program rather than one-off tests: research feeds hypotheses, tests are run to a plan, and results, wins and losses alike, inform what is tested next."
      },
      {
        "q": "Which A/B testing tools do you work with?",
        "a": "VWO, Convert and Shoplift most often, and other client-side tools a client already pays for after a quick check. Variations are built in JavaScript and CSS and QA-tested across devices before launch."
      },
      {
        "q": "How do you decide what to test first?",
        "a": "By how much the change could matter, how likely it is to change behaviour, and how cheap it is to ship. We write the hypothesis, the metric and the decision rule before anything is built."
      },
      {
        "q": "How long does an experiment need to run?",
        "a": "It depends on traffic and on how big a difference you want to detect. Rather than a fixed number of days, we size the test for your traffic volume so the read out is not a coin flip. If traffic is too low for a clean A/B test, we will say so and suggest alternatives."
      },
      {
        "q": "What if the variant loses?",
        "a": "A loss is still a result: it tells you what your visitors responded to and prevents a change that would have wasted engineering time. Read-outs report both outcomes honestly."
      },
      {
        "q": "Do you handle the tool setup as well?",
        "a": "If testing is not yet in place, the experiment setup and event validation can be part of the scope. If you already have a platform, we work inside it and document the configuration."
      }
    ]
  },
  {
    "id": "shopify-audits",
    "name": "Shopify Store Audit",
    "navTitle": "Shopify Store Audit",
    "grp": "CRO and testing",
    "ill": "shop",
    "demo": "funnel",
    "title": "Shopify Store and Mobile Experience Audit",
    "kw": "Shopify CRO audit",
    "metaTitle": "Shopify Store Audit: Product Page, Cart and Mobile UX | CROLANE",
    "metaDescription": "A Shopify store audit covering product pages, cart, mobile UX, apps and speed, with the top fixes built and shipped on a duplicate theme.",
    "short": "Theme, apps, speed and checkout checked end to end, with the top fixes shipped.",
    "h1": "A Shopify audit that finds lost sales and slow pages",
    "lede": "We review your theme, apps, speed, product pages and cart on real phones, then ship the fixes that cost you orders. All work happens on a duplicate theme.",
    "get": [
      [
        "Theme and UX review",
        "Navigation, collections, product pages and cart drawer."
      ],
      [
        "App and speed check",
        "Which apps slow you down and what to remove."
      ],
      [
        "Cart and checkout",
        "Shipping, payment and upsell steps that cause drop off."
      ],
      [
        "Fixes shipped",
        "Top fixes built on a duplicate theme, live after your OK."
      ]
    ],
    "fix": [
      "Too many apps loading on every page",
      "Cart drawer that hides shipping cost until checkout",
      "Heavy images and videos that slow mobile pages",
      "Upsells that distract instead of add value"
    ],
    "slug": "shopify-audits",
    "path": "/services/shopify-audits/",
    "faqs": [
      {
        "q": "Do you need access to our Shopify admin?",
        "a": "A storefront audit runs on the public experience, so most reviews need no admin access at all. If deeper work is agreed, like theme review or app configuration, access is requested separately with the least privilege that works."
      },
      {
        "q": "Is this only for Shopify themes?",
        "a": "The service is built around Shopify storefronts: theme structure, product templates, cart and checkout expectations, app-injected elements. The checkout itself is partly Shopify controlled, which is factored into what can and cannot be changed."
      },
      {
        "q": "Do you build custom storefronts or headless builds?",
        "a": "No, custom storefront development is not part of this service. The audit delivers findings and prioritised recommendations; implementation can be handled by your theme partner or scoped as a separate, specific project."
      },
      {
        "q": "What about AI shopping features and recommendations?",
        "a": "Discovery and recommendation experiences are reviewed where they exist on your store, and we advise on where AI assisted discovery could genuinely help. Recommendations always use your catalog context, never invented inventory."
      }
    ]
  },
  {
    "id": "ga4-tag-manager",
    "name": "GA4 and Tag Manager",
    "navTitle": "GA4 and Tag Manager",
    "grp": "Analytics",
    "ill": "ga4",
    "demo": "ga4",
    "title": "GA4, Google Tag Manager and Analytics Implementation",
    "kw": "GA4 setup service",
    "metaTitle": "GA4 and Google Tag Manager Setup for Shopify | CROLANE",
    "metaDescription": "GA4 and GTM set up or repaired: purchase and add_to_cart events, duplicate conversions, consent mode and clean reporting you can trust.",
    "short": "Ecommerce tracking through Tag Manager, tested and documented, so every sale counts once.",
    "h1": "GA4 tracking you can actually trust",
    "lede": "Full ecommerce events through Google Tag Manager, tested in DebugView and documented, so every purchase, add to cart and lead is counted once and correctly.",
    "get": [
      [
        "Tracking plan",
        "Every event and parameter mapped to your business goals."
      ],
      [
        "GTM build",
        "A clean container with naming rules and version notes."
      ],
      [
        "Ecommerce events",
        "view_item to purchase, with value and item data."
      ],
      [
        "QA and docs",
        "Tested end to end, plus a short guide for your team."
      ]
    ],
    "fix": [
      "Purchases counted twice or not at all",
      "GA4 revenue that does not match Shopify",
      "Messy GTM containers nobody understands",
      "Consent mode missing for EU traffic"
    ],
    "slug": "ga4-tag-manager",
    "path": "/services/ga4-tag-manager/",
    "faqs": [
      {
        "q": "Our GA4 is already set up. Can you review it instead of starting fresh?",
        "a": "Yes. Existing properties are audited first: events, parameters, conversions, filters, consent settings and data quality. If the foundation is sound, we keep it and fix what is not. Rebuilding without a reason wastes history you may still need."
      },
      {
        "q": "Do you work inside our Google Tag Manager container?",
        "a": "That is the normal arrangement. We use your account, document every tag, trigger and variable we add, and leave the container in a state your team can understand and maintain."
      },
      {
        "q": "Will this create duplicate data?",
        "a": "Duplicate collection is one of the first things checked. Implementations include validation passes that look for double firing, missing parameters and conflicting tags before anything is declared done."
      },
      {
        "q": "Can you build reports for our team?",
        "a": "Yes, reporting views can be part of the scope: explorations, dashboards and plain language guides so the people making decisions can find the answers without asking an analyst every time."
      }
    ]
  },
  {
    "id": "conversion-tracking",
    "name": "Conversion Tracking",
    "navTitle": "Conversion Tracking",
    "grp": "Analytics",
    "ill": "tags",
    "demo": "tags",
    "title": "Conversion Tracking and Behaviour Analytics",
    "kw": "Conversion tracking setup",
    "metaTitle": "Conversion Tracking Setup: GA4, Meta CAPI and Heatmaps | CROLANE",
    "metaDescription": "Conversion tracking you can trust: GA4 events, Meta Pixel and CAPI, Google Ads enhanced conversions, plus Hotjar or Clarity heatmaps.",
    "short": "Meta, Google Ads and GA4 conversions firing right, plus heatmaps that show why.",
    "h1": "Conversion tracking that feeds your ads the right data",
    "lede": "Meta Pixel and CAPI, Google Ads enhanced conversions and GA4 events checked and fixed, plus Hotjar or Clarity so you can see why people leave.",
    "get": [
      [
        "Pixel and API setup",
        "Browser and server events with deduplication."
      ],
      [
        "Enhanced conversions",
        "Google Ads set up with hashed customer data."
      ],
      [
        "Behaviour analytics",
        "Heatmaps and recordings on the pages that matter."
      ],
      [
        "Health check",
        "Every tag tested, with a short report of what changed."
      ]
    ],
    "fix": [
      "Ads optimizing on add to carts instead of sales",
      "Duplicate purchase events inflating ROAS",
      "Low event match quality in Meta",
      "No way to see why visitors leave"
    ],
    "slug": "conversion-tracking",
    "path": "/services/conversion-tracking/",
    "faqs": [
      {
        "q": "How is this different from the GA4 implementation service?",
        "a": "Analytics implementation is about building the collection layer: properties, tags, configuration. Conversion tracking and behaviour analytics is about the questions: which conversions matter, which paths to trace, which drop-offs to investigate, and what the patterns mean for decisions."
      },
      {
        "q": "Do you record our users or access private data?",
        "a": "No. Behaviour work uses aggregated analytics, and if session replay tools are involved we work inside accounts you own, under your consent configuration. The demonstration on this page is simulated and collects nothing."
      },
      {
        "q": "What if our tracking is currently broken?",
        "a": "That is a normal starting point. Repairs are scoped first: identify what is wrong, fix the collection, then rebuild the analysis on top of data you can trust."
      },
      {
        "q": "What formats do findings come in?",
        "a": "Funnel views, annotated journey maps, event timelines and a written analysis linking each observation to a suggested next step. Everything is designed to be read by non-analysts."
      }
    ]
  },
  {
    "id": "ai-voice-agents",
    "name": "AI Voice Receptionist",
    "navTitle": "AI Voice Receptionist",
    "grp": "AI services",
    "ill": "voice",
    "demo": "voice",
    "title": "AI Voice Receptionist and Voice Agents",
    "kw": "AI voice receptionist",
    "metaTitle": "AI Voice Receptionist That Answers Calls 24/7 | CROLANE",
    "metaDescription": "An AI receptionist that answers every call, handles routine questions, captures leads and books appointments. Built on Vapi or Retell. From $1,000.",
    "short": "A voice agent that answers every call 24/7, books appointments and sends you a summary.",
    "h1": "An AI receptionist that answers every call and books the job",
    "lede": "A natural sounding voice agent that picks up 24/7, answers from information you approve, books into your calendar and sends you a summary of every call.",
    "get": [
      [
        "Custom voice agent",
        "Trained on your services, hours and FAQs."
      ],
      [
        "Calendar booking",
        "Books into Google Calendar, Calendly or your CRM."
      ],
      [
        "Call summaries",
        "Every call logged with a short summary and next step."
      ],
      [
        "Handoff rules",
        "Urgent or sensitive calls routed to a person."
      ]
    ],
    "fix": [
      "Missed calls after hours and on weekends",
      "Staff stuck answering the same questions",
      "Leads that never get a call back",
      "No record of what callers asked for"
    ],
    "slug": "ai-voice-agents",
    "path": "/services/ai-voice-agents/",
    "faqs": [
      {
        "q": "Does the voice agent replace our phone system?",
        "a": "No. It sits on top of the call flow you already have, usually through a platform that forwards or answers calls. Your existing numbers and phone setup stay in place."
      },
      {
        "q": "What can it answer confidently?",
        "a": "Questions from information you approve: opening hours, services, pricing basics, locations, what to bring, what happens next. Anything outside that material routes to a person or a callback instead of guessing."
      },
      {
        "q": "Can it book directly into our calendar?",
        "a": "Basic appointment or quote requests can be captured where the selected platform supports it. Live calendar synchronisation is not a standard inclusion and depends on your stack, access and what we confirm as feasible during scoping."
      },
      {
        "q": "What happens on complex or sensitive calls?",
        "a": "The agent hands off: it takes the details, promises a callback from a person, or passes the call through if your setup supports live transfer. Escalation behaviour is agreed with you before anything goes live."
      }
    ]
  },
  {
    "id": "ai-automation",
    "name": "AI Workflow Automation",
    "navTitle": "AI Workflow Automation",
    "grp": "AI services",
    "ill": "flow",
    "demo": "flow",
    "title": "AI Agentic Workflows and n8n Automation",
    "kw": "n8n AI automation",
    "metaTitle": "AI Agentic Workflows and n8n Automation | CROLANE",
    "metaDescription": "Custom AI agent workflows in n8n: lead triage, document extraction, drafting and routing, with logging and human review. From $750.",
    "short": "n8n workflows that qualify leads, draft replies and update your CRM without manual work.",
    "h1": "AI workflows that do the busy work for your team",
    "lede": "Custom n8n agent workflows that read, sort, draft and route work, with logging and human checkpoints where it matters. Your team keeps the judgement calls.",
    "get": [
      [
        "Workflow mapping",
        "We find the tasks that eat the most hours."
      ],
      [
        "n8n build",
        "Reliable workflows with error alerts and retries."
      ],
      [
        "AI steps",
        "Classify, extract and draft with the right model for each step."
      ],
      [
        "Handover",
        "Docs and a recorded walkthrough, so you own it."
      ]
    ],
    "fix": [
      "Leads waiting hours for a first reply",
      "Copy and paste between tools all day",
      "Reports built by hand every week",
      "An inbox full of repeat questions"
    ],
    "slug": "ai-automation",
    "path": "/services/ai-automation/",
    "faqs": [
      {
        "q": "What kinds of workflows are a good fit?",
        "a": "Repetitive, rule-shaped work with clear inputs: triaging form submissions, drafting replies from approved templates, extracting fields from documents or emails, routing tasks, producing internal summaries. If your team does the same reading and copying every day, it is worth examining."
      },
      {
        "q": "Will the AI act on customers without approval?",
        "a": "Not unless you explicitly decide it should. Most builds keep a human checkpoint on anything customer facing or financially meaningful, and automate the reading, sorting and drafting around it."
      },
      {
        "q": "Which tools do you build with?",
        "a": "Mostly n8n (self-hosted or cloud), plus Make or Zapier when that is what you already use, connected to OpenAI, Anthropic or Gemini models, Google Workspace, Slack, CRMs and webhooks. The tool is chosen for your stack, not the other way round."
      },
      {
        "q": "Do we need a specific CRM or platform?",
        "a": "No single stack is assumed. Feasibility depends on the tools you use, the access they allow and the cost of connecting them. That check happens during scoping, before you pay for a build that cannot connect."
      },
      {
        "q": "What happens when the AI gets it wrong?",
        "a": "Workflows are designed for that: confidence thresholds, fallback routes, review queues and logs of every run. Wrong outputs should be catchable, visible and cheap to correct. If a process cannot tolerate that, it should stay manual."
      }
    ]
  },
  {
    "id": "ai-agent-audit",
    "name": "AI Agent Audit",
    "navTitle": "AI Agent Audit",
    "grp": "AI services",
    "ill": "chip",
    "demo": "cost",
    "title": "AI Agent and Automation Audit",
    "kw": "AI agent audit",
    "metaTitle": "AI Agent Audit: Cost, Reliability and Security Review | CROLANE",
    "metaDescription": "Audit your AI agents, chatbots and n8n or Make automations: token spend, failure rates, data risks and a ranked fix plan. From $500.",
    "short": "A review of your AI agents that cuts model costs and fixes the failures nobody notices.",
    "h1": "Make your AI agents cheaper, faster and more reliable",
    "lede": "We review the agents, prompts and automations you already run, find where money and accuracy leak, and give you a fix plan with estimated savings.",
    "get": [
      [
        "Cost breakdown",
        "Spend per agent, model and run."
      ],
      [
        "Reliability review",
        "Where answers go wrong, loop or fail silently."
      ],
      [
        "Risk check",
        "Prompts, permissions and data exposure."
      ],
      [
        "Fix plan",
        "Changes ranked by savings, with an optional build."
      ]
    ],
    "fix": [
      "Every request sent to the most expensive model",
      "Full chat history sent on every call",
      "Agents stuck in loops on failed tool calls",
      "No logging, so failures go unnoticed"
    ],
    "slug": "ai-agent-audit",
    "path": "/services/ai-agent-audit/",
    "faqs": [
      {
        "q": "What does an AI agent audit cover?",
        "a": "Four things: cost (model, token and API spend per task), reliability (how often runs fail, loop or give wrong answers), risk (prompt injection, data exposure, over-broad permissions) and fit (whether each step needs AI at all). You get a prioritised list of fixes with the expected effect of each."
      },
      {
        "q": "Which tools and platforms can you audit?",
        "a": "Agents and automations built in n8n, Make, Zapier, Vapi, Retell, custom code calling OpenAI, Anthropic or Gemini APIs, and website chatbots. If it runs on prompts, tools and logs, it can usually be reviewed."
      },
      {
        "q": "How can an audit reduce AI costs?",
        "a": "Common savings come from using a smaller model for simple steps, trimming oversized prompts and context, caching repeated calls, stopping retry loops, and replacing AI steps that plain rules handle just as well. The audit estimates spend per run before and after so you can see the difference."
      },
      {
        "q": "What access do you need?",
        "a": "Read access to the workflows or code, recent run logs, and billing or usage pages for the AI providers. Production write access is not needed for the audit itself."
      },
      {
        "q": "Will you fix the problems too?",
        "a": "Yes, if you want. The audit ends with a fixed-price quote for the top fixes. Many are small: a model swap, a guardrail, a tighter prompt, a permission removed."
      }
    ]
  }
] as Service[];

/** Public price label from the admin panel. Empty means "custom quote". */
export const priceFor = (id: string): string => {
  const row = pricing.services.find((p) => p.id === id);
  const label = row?.from?.trim() || '';
  return /\$/.test(label) ? label : '';
};

export const serviceBySlug = (slug: string): Service | undefined => SERVICES.find((s) => s.slug === slug);

/** Service selector options for the contact form. */
export const SERVICE_OPTIONS = [
  { value: 'free-mini-audit', label: 'Free 3-leak video audit' },
  ...(bfcm.enabled ? bfcm.packages : []).map((p) => ({ value: `bfcm-${p.id}`, label: `Offer: ${p.name} ($${p.price})` })),
  ...SERVICES.map((s) => ({ value: s.id, label: s.name })),
  { value: 'not-sure', label: 'Not sure yet' },
];
