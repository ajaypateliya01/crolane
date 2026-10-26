/**
 * End-to-end contact-form test:
 *  1. starts a local SMTP mock (smtp-server) that records messages
 *  2. starts the production server (dist/server/entry.mjs) pointed at it
 *  3. exercises validation, honeypot, time gate, redirects and real delivery
 * Usage: npm run build && npm run test:mail
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SMTPServer } from 'smtp-server';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'dist', 'server', 'entry.mjs');
if (!existsSync(entry)) {
  console.error('dist/server/entry.mjs not found. Run `npm run build` first.');
  process.exit(1);
}

const SMTP_PORT = Number(process.env.TEST_SMTP_PORT || 3525);
const APP_PORT = Number(process.env.TEST_APP_PORT || 4411);
const RATE_PORT = Number(process.env.TEST_RATE_PORT || 4412);

const received = [];
const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  onAuth(auth, _session, callback) {
    callback(null, { user: auth.username });
  },
  onData(stream, _session, callback) {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => {
      received.push(Buffer.concat(chunks).toString('utf8'));
      callback();
    });
  },
});

function listen(server, port) {
  return new Promise((res, rej) => {
    server.once('error', rej);
    server.listen(port, '127.0.0.1', () => res());
  });
}

function startApp(port, extraEnv = {}) {
  const child = spawn(process.execPath, [entry], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(port),
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(SMTP_PORT),
      SMTP_SECURE: 'false',
      SMTP_USER: 'test-user',
      SMTP_PASS: 'test-pass',
      MAIL_FROM: 'CROLANE Website <no-reply@crolane.in>',
      MAIL_TO: 'admin@crolane.in',
      ALLOWED_ORIGINS: `http://localhost:${port}`,
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr.on('data', (d) => process.stderr.write(`[app:${port}] ${d}`));
  return child;
}

async function waitForPort(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, { redirect: 'manual' });
      if (res.status) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server on :${port} did not start in ${timeoutMs}ms`);
}

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${!cond && detail ? ` — ${detail}` : ''}`);
}

const formBody = (overrides = {}) =>
  new URLSearchParams({
    name: 'Test Person',
    email: 'test@example.com',
    company: 'Example Co',
    website: 'example.com',
    service: 'cro-audit',
    details: 'This is a test enquiry with enough characters.',
    company_notes: '',
    elapsed: '4000',
    ...overrides,
  }).toString();

const jsonBody = (overrides = {}) =>
  JSON.stringify({
    name: 'JSON Person',
    email: 'json@example.com',
    service: 'ab-testing',
    details: 'A JSON mode enquiry with enough characters.',
    elapsed: '4000',
    ...overrides,
  });

let app;
let rateApp;
try {
  await listen(smtp, SMTP_PORT);
  app = startApp(APP_PORT, { RATE_LIMIT_SKIP: '127.0.0.1' });
  await waitForPort(APP_PORT);
  const base = `http://127.0.0.1:${APP_PORT}`;

  // --- pages -------------------------------------------------------------
  const home = await fetch(`${base}/`);
  check('GET / is 200', home.status === 200, `got ${home.status}`);
  const homeHtml = await home.text();
  check('GET / has CROLANE title', homeHtml.includes('<title>CROLANE'));
  check('GET / contains hero visual stage', homeHtml.includes('viz-stage'));

  const svc = await fetch(`${base}/services/`);
  check('GET /services/ is 200', svc.status === 200, `got ${svc.status}`);

  const missing = await fetch(`${base}/definitely-not-a-page/`);
  check('unknown route is 404', missing.status === 404, `got ${missing.status}`);

  const wrongMethod = await fetch(`${base}/api/contact`);
  check('GET /api/contact is 405', wrongMethod.status === 405, `got ${wrongMethod.status}`);

  // --- validation --------------------------------------------------------
  const origin = `${base}`;
  const badType = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain', origin },
    body: 'hello',
  });
  check('wrong content type is 415', badType.status === 415, `got ${badType.status}`);

  const noTiming = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: jsonBody({ elapsed: undefined }),
  });
  check('missing time gate is rejected (400)', noTiming.status === 400, `got ${noTiming.status}`);

  const honeypot = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: jsonBody({ company_notes: 'spam' }),
  });
  check('honeypot filled is rejected (400)', honeypot.status === 400, `got ${honeypot.status}`);

  const badEmail = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: jsonBody({ email: 'not-an-email' }),
  });
  const badEmailJson = await badEmail.json().catch(() => ({}));
  check(
    'invalid email is 422 with field error',
    badEmail.status === 422 && !!badEmailJson.errors?.email,
    `got ${badEmail.status} ${JSON.stringify(badEmailJson)}`
  );

  const big = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Big Person',
      email: 'big@example.com',
      service: 'cro-audit',
      details: 'x'.repeat(60 * 1024),
      elapsed: '4000',
    }),
  });
  check('oversized body is 413', big.status === 413, `got ${big.status}`);

  // --- delivery ----------------------------------------------------------
  const before = received.length;
  const jsonOk = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: jsonBody(),
  });
  const jsonOkJson = await jsonOk.json().catch(() => ({}));
  check(
    'valid JSON submission is 200 ok',
    jsonOk.status === 200 && jsonOkJson.ok === true,
    `got ${jsonOk.status} ${JSON.stringify(jsonOkJson)}`
  );
  await new Promise((r) => setTimeout(r, 800));
  check('SMTP mock received the JSON email', received.length === before + 1, `${received.length - before} new`);
  const mail1 = received[received.length - 1] || '';
  check(
    'email addresses admin@crolane.in',
    /admin@crolane\.in/i.test(mail1),
    mail1.slice(0, 300)
  );
  check('email contains the enquiry text', mail1.includes('JSON mode enquiry'));

  const beforeForm = received.length;
  const formOk = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin },
    body: formBody(),
    redirect: 'manual',
  });
  check(
    'valid form submission 303-redirects to sent=1',
    formOk.status === 303 && (formOk.headers.get('location') || '').includes('/contact/?sent=1'),
    `got ${formOk.status} ${formOk.headers.get('location')}`
  );
  await new Promise((r) => setTimeout(r, 800));
  check('SMTP mock received the form email', received.length === beforeForm + 1);
  const mail2 = received[received.length - 1] || '';
  check('form email includes the chosen service label', /CRO Audit/i.test(mail2));

  const foreignOrigin = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin: 'https://evil.example' },
    body: formBody(),
    redirect: 'manual',
  });
  check(
    'foreign-origin form POST is blocked (403)',
    foreignOrigin.status === 403,
    `got ${foreignOrigin.status}`
  );

  const formBad = await fetch(`${base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin },
    body: formBody({ email: 'broken' }),
    redirect: 'manual',
  });
  check(
    'invalid form submission redirects to failed=1',
    formBad.status === 303 && (formBad.headers.get('location') || '').includes('/contact/?failed=1'),
    `got ${formBad.status} ${formBad.headers.get('location')}`
  );

  // --- rate limiting (separate instance without skip) --------------------
  rateApp = startApp(RATE_PORT);
  await waitForPort(RATE_PORT);
  const rateBase = `http://127.0.0.1:${RATE_PORT}`;
  let sawLimit = false;
  let lastStatus = 0;
  for (let i = 0; i < 8; i++) {
    const r = await fetch(`${rateBase}/api/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: jsonBody({ email: `burst${i}@example.com` }),
    });
    lastStatus = r.status;
    if (r.status === 429) {
      sawLimit = true;
      break;
    }
  }
  check('repeated posts trigger 429 rate limit', sawLimit, `last status ${lastStatus}`);
} finally {
  for (const child of [app, rateApp]) {
    if (child && !child.killed) child.kill('SIGTERM');
  }
  smtp.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  for (const f of failed) console.error(`  ✗ ${f.name} ${f.detail}`);
  process.exit(1);
}
console.log('✓ Contact pipeline, validation and delivery all good.');
