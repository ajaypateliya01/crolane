import type { APIRoute } from 'astro';
import { SERVICE_OPTIONS } from '../../config/services';
import { SITE } from '../../config/site';
import { sendContactEmail } from '../../lib/mail';

export const prerender = false;

const MAX_BODY = 50 * 1024; // 50 KB
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

/** Minimal in-memory sliding window limiter (per process). */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  if (
    process.env.RATE_LIMIT_SKIP?.split(',').some((entry) => entry.trim() === ip)
  ) {
    return false;
  }
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) {
    // Drop the oldest bucket to bound memory usage.
    const first = hits.keys().next().value;
    if (first) hits.delete(first);
  }
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  // Strip control characters, normalise whitespace for single-line fields.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max);
}

function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, max);
}

function validate(body: Record<string, unknown>) {
  const errors: Record<string, string> = {};

  const name = clean(body.name, 120).trim();
  if (name.length < 2) errors.name = 'Please enter your full name.';

  const email = clean(body.email, 200).trim();
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid business email.';

  const company = clean(body.company, 140).trim();
  const website = clean(body.website, 300).trim();
  if (website && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(website)) {
    errors.website = 'Please enter a valid website URL (or leave it blank).';
  }

  const service = clean(body.service, 80);
  const serviceOption = SERVICE_OPTIONS.find((o) => o.value === service);
  if (!serviceOption) errors.service = 'Please choose one of the seven services.';

  const details = cleanMultiline(body.details, 4000).trim();
  if (details.length < 10) errors.details = 'Please add a few details about your project.';
  if (details.length > 4000) errors.details = 'Please keep the details under 4000 characters.';

  // Honeypot: hidden from real users, tempting for bots.
  const trap = clean(body.company_notes, 400);
  if (trap.length > 0) errors.__bot = 'Submission rejected.';

  // Time gate: the form stamps elapsed milliseconds between render and submit.
  const elapsedRaw = Number(body.elapsed);
  if (
    !Number.isFinite(elapsedRaw) ||
    elapsedRaw < 1500 ||
    elapsedRaw > 12 * 60 * 60 * 1000
  ) {
    errors.__bot = 'Submission rejected.';
  }

  return {
    errors,
    payload: { name, email, company, website, service, details },
    serviceName: serviceOption?.label ?? '',
  };
}

type Mode = 'json' | 'form';

function redirect(location: string, status: 303) {
  return new Response(null, { status, headers: { location, 'cache-control': 'no-store' } });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || 'unknown';

  const contentType = request.headers.get('content-type') || '';
  const mode: Mode = contentType.includes('application/json')
    ? 'json'
    : contentType.includes('application/x-www-form-urlencoded')
      ? 'form'
      : null as unknown as Mode;

  if (!mode) {
    return json(415, { ok: false, message: 'Expected a JSON or form request.' });
  }

  if (rateLimited(ip)) {
    if (mode === 'form') return redirect('/contact/?failed=1', 303);
    return json(429, {
      ok: false,
      message: 'Too many attempts. Please wait a few minutes and try again.',
    });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json(400, { ok: false, message: 'Could not read the request.' });
  }
  if (raw.length > MAX_BODY) {
    return json(413, { ok: false, message: 'Request too large.' });
  }

  let body: Record<string, unknown>;
  try {
    if (mode === 'form') {
      const params = new URLSearchParams(raw);
      body = Object.fromEntries(params.entries());
    } else {
      body = JSON.parse(raw) as Record<string, unknown>;
    }
  } catch {
    return json(400, { ok: false, message: 'Invalid payload.' });
  }

  const { errors, payload, serviceName } = validate(body);
  if (Object.keys(errors).length > 0) {
    const { __bot, ...fieldErrors } = errors;
    if (__bot) {
      if (mode === 'form') return redirect('/contact/?failed=1', 303);
      return json(400, { ok: false, message: 'Submission rejected.' });
    }
    if (mode === 'form') return redirect('/contact/?failed=1', 303);
    return json(422, { ok: false, errors: fieldErrors });
  }

  // Development convenience: log instead of sending when explicitly enabled
  // and the runtime is not production.
  const devLog =
    process.env.MAIL_DEV_LOG === 'true' && process.env.NODE_ENV !== 'production';
  if (devLog) {
    console.info('[contact] MAIL_DEV_LOG is on, not sending email:', {
      ...payload,
      details: `${payload.details.slice(0, 120)}...`,
    });
    if (mode === 'form') return redirect('/contact/?sent=1', 303);
    return json(200, {
      ok: true,
      message: 'Dev mode: the submission was logged instead of emailed.',
    });
  }

  try {
    await sendContactEmail(payload, serviceName);
    if (mode === 'form') return redirect('/contact/?sent=1', 303);
    return json(200, { ok: true, message: 'Thanks, your enquiry has been sent.' });
  } catch (err) {
    const e = err as Error & { code?: string };
    if (mode === 'form') {
      console.error('[contact] delivery failed:', e.code || e.message);
      return redirect('/contact/?failed=1', 303);
    }
    if (e.code === 'SMTP_NOT_CONFIGURED') {
      console.error('[contact] SMTP is not configured. Set SMTP_* environment variables.');
      return json(503, {
        ok: false,
        message:
          'Email delivery is not configured on this server yet. Please email us directly at ' +
          SITE.email +
          '.',
      });
    }
    console.error('[contact] Failed to send enquiry:', e.message);
    return json(502, {
      ok: false,
      message: 'We could not send your message right now. Please try again shortly.',
    });
  }
};

export const GET: APIRoute = () =>
  json(405, { ok: false, message: 'Method not allowed.' });

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
