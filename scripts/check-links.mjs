/**
 * Internal link + asset checker for the prerendered build.
 * Scans every HTML file in dist/client, verifies:
 *  - internal href/src point at files that exist in the build
 *  - #hash anchors resolve to ids present in the target page
 *  - referenced static assets exist
 * Usage: npm run build && npm run test:links
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', 'client');

if (!existsSync(dist)) {
  console.error('dist/client not found. Run `npm run build` first.');
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));

function resolvePath(urlPath) {
  let p = urlPath.split('#')[0].split('?')[0];
  if (p === '' || p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  const full = join(dist, p);
  if (existsSync(full) && statSync(full).isDirectory()) return join(full, 'index.html');
  if (existsSync(full)) return full;
  if (!existsSync(full) && existsSync(full + '.html')) return full + '.html';
  return null;
}

const idCache = new Map();
function idsOf(file) {
  if (idCache.has(file)) return idCache.get(file);
  const html = readFileSync(file, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)) ids.add(m[1]);
  idCache.set(file, ids);
  return ids;
}

const errors = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(dist.length + 1);
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src|action)\s*=\s*["']([^"']+)["']/g)) refs.push(m[1]);

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref)) continue;
    if (ref.startsWith('/api/')) continue; // server routes handled by the SSR app
    checked++;
    if (ref.startsWith('#')) {
      const id = ref.slice(1);
      if (id && !idsOf(file).has(id)) errors.push(`${rel}: anchor #${id} not found on page`);
      continue;
    }
    const [pathPart, hash] = ref.split('#');
    let target;
    if (ref.startsWith('/')) {
      target = resolvePath(pathPart || '/');
    } else {
      const abs = resolve(dirname(file), pathPart);
      const relToDist = abs.startsWith(dist) ? abs.slice(dist.length + 1) : null;
      target = relToDist ? resolvePath('/' + relToDist) : null;
    }
    if (!target) {
      errors.push(`${rel}: broken ref -> ${ref}`);
      continue;
    }
    if (hash) {
      const id = decodeURIComponent(hash);
      if (!idsOf(target).has(id)) {
        errors.push(`${rel}: anchor ${ref} not found in ${target.slice(dist.length + 1)}`);
      }
    }
  }
}

console.log(`Checked ${checked} internal refs across ${htmlFiles.length} HTML files.`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('✓ All internal links, anchors and assets resolve.');
