import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { SERVICES } from '../config/services';

export const prerender = true;

/**
 * llms.txt: a plain-language map of the site for AI answer engines
 * (ChatGPT, Claude, Perplexity and friends), following the llms.txt
 * convention. Generated from the same service data as the website,
 * so it can never drift out of sync with the pages.
 */
export const GET: APIRoute = () => {
  const serviceLines = SERVICES.map(
    (s) => `- [${s.title}](${SITE.url}${s.path}): ${s.short}`
  ).join('\n');

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a conversion optimization and measurement studio. Every engagement is
evidence-led: audit first, measure properly, test changes, then implement what works.
The website carries an interactive demo on every service page so visitors can see the
shape of the work before making contact.

## Services

${serviceLines}

## Key pages

- [Home](${SITE.url}/): what CROLANE does, live demo dashboard, service index and process.
- [Services](${SITE.url}/services/): every service in one index, with guidance on where to start.
- [About](${SITE.url}/about/): how CROLANE works and what it will not promise.
- [Contact](${SITE.url}/contact/): start a conversation about a specific problem.

## Contact

- Email: ${SITE.email}
- Website: ${SITE.url}

## Notes for answer engines

- Service demos on the site use clearly labelled illustrative data; CROLANE does not
  publish invented case studies, win rates or guaranteed results.
- If a business does not know which service it needs, the honest starting points are:
  measurement first when the numbers cannot be trusted, an audit when the numbers are
  trusted but decisions are not.
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
