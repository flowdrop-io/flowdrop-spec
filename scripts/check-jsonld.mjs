#!/usr/bin/env node
/**
 * Structured data, checked on the BUILT html — what a crawler actually receives.
 *
 * Fails unless, for every page of the static export (error pages excepted):
 *   1. there is exactly one <script type="application/ld+json">, it parses, and no
 *      raw "<" survives inside it (a rule quoting </script> must not close the tag);
 *   2. every {"@id": ...} reference resolves: to a node in the page's own graph, to
 *      an id in `knownIds` of shared-entities.json, or to a node defined on another
 *      page of this site (a rule's isPartOf names its family, which is defined on the
 *      family's page — `knownIds` cannot list 30 families and 399 rules);
 *   3. WebPage.url == <link rel="canonical"> == the sitemap <loc>; and the WebPage's
 *      name and description equal the page's <title> and meta description;
 *   4. no field is empty or holds "TODO", "lorem" or "placeholder". The word check
 *      skips `name`, `headline`, `description` and `text`: those carry the rule
 *      corpus verbatim, and several rules legitimately discuss placeholders;
 *   5. the emitted shared entities equal shared-entities.json's `entities`;
 *   6. every contentUrl on this site is a file the export contains.
 * Also: no @id is defined twice on one page.
 *
 * Run: node scripts/check-jsonld.mjs [site/out]   (after `npm run build` in site/)
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, process.argv[2] ?? 'site/out');
const ORIGIN = 'https://flowdrop.io/spec';
const SHARED = JSON.parse(readFileSync(join(root, 'site/lib/jsonld/shared-entities.json'), 'utf8'));

if (!existsSync(out)) {
  console.error(`::error::${relative(root, out)} does not exist; build the site first`);
  process.exit(1);
}

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

const SKIP = new Set(['404.html', '404/index.html', '_not-found/index.html']);
function htmlFiles(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith('.html') && !SKIP.has(relative(out, p))) acc.push(p);
  }
  return acc;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");

const stable = (v) =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1)))
      : x,
  );

const sitemap = new Set(
  [...readFileSync(join(out, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1])),
);

// ---- pass 1: extract and parse
const pages = [];
const defined = new Set(); // every @id defined anywhere on the site
for (const file of htmlFiles(out)) {
  const rel = relative(out, file);
  const url = rel === 'index.html' ? `${ORIGIN}/` : `${ORIGIN}/${rel.replace(/index\.html$/, '')}`;
  const html = readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (blocks.length !== 1) {
    fail(url, `${blocks.length} JSON-LD blocks, expected exactly 1`);
    continue;
  }
  if (blocks[0][1].includes('<')) fail(url, 'raw "<" inside the JSON-LD block');
  let doc;
  try {
    doc = JSON.parse(blocks[0][1]);
  } catch (e) {
    fail(url, `JSON-LD does not parse: ${e.message}`);
    continue;
  }
  if (doc['@context'] !== 'https://schema.org' || !Array.isArray(doc['@graph'])) {
    fail(url, 'expected {"@context":"https://schema.org","@graph":[...]}');
    continue;
  }
  const ids = new Set();
  for (const n of doc['@graph']) {
    if (!n['@id']) {
      fail(url, `graph node of type ${n['@type']} has no @id`);
      continue;
    }
    if (ids.has(n['@id'])) fail(url, `@id defined twice: ${n['@id']}`);
    ids.add(n['@id']);
    defined.add(n['@id']);
  }
  pages.push({ url, html, graph: doc['@graph'], ids });
}

// ---- pass 2: per-page rules
const known = new Set(SHARED.knownIds);
const BANNED = /\b(todo|lorem|placeholder)\b/i;
const CONTENT_KEYS = new Set(['name', 'headline', 'description', 'text']);
const counts = {};
let crossPage = 0;

function walk(url, v, path, graph) {
  if (v === null || v === undefined || v === '') return fail(url, `empty field ${path}`);
  if (Array.isArray(v)) {
    if (!v.length) fail(url, `empty list ${path}`);
    v.forEach((x, i) => walk(url, x, `${path}[${i}]`, graph));
  } else if (typeof v === 'object') {
    const keys = Object.keys(v);
    if (!keys.length) fail(url, `empty object ${path}`);
    if (keys.length === 1 && keys[0] === '@id') {
      const id = v['@id'];
      if (graph.ids.has(id) || known.has(id)) return;
      if (defined.has(id)) return void crossPage++;
      return fail(url, `unresolved reference ${id} at ${path}`);
    }
    for (const [k, x] of Object.entries(v)) walk(url, x, `${path}.${k}`, graph);
  } else if (typeof v === 'string') {
    const key = path.split('.').pop().replace(/\[\d+\]$/, '');
    if (!CONTENT_KEYS.has(key) && BANNED.test(v)) fail(url, `placeholder text at ${path}: ${v.slice(0, 60)}`);
    if (!v.trim()) fail(url, `blank string at ${path}`);
    const m = /^https:\/\/flowdrop\.io\/spec\/(.*)$/.exec(v);
    if (m && key === 'contentUrl') {
      const p = m[1];
      const file = /^rules\/[^/]+\/[^/]+\.md$/.test(p)
        ? p.replace(/^rules\//, 'llms/')
        : /^(conventions|glossary)\.md$/.test(p)
          ? `llms/${p}`
          : p;
      if (!existsSync(join(out, file)) || !statSync(join(out, file)).isFile()) fail(url, `contentUrl ${v} is not in the export`);
    }
  }
}

for (const pg of pages) {
  const { url, html, graph } = pg;
  for (const n of graph) for (const t of [].concat(n['@type'])) counts[t] = (counts[t] ?? 0) + 1;
  walk(url, graph, '@graph', pg);

  // 5. shared entities unchanged
  for (const e of SHARED.entities) {
    const got = graph.find((n) => n['@id'] === e['@id']);
    if (!got || stable(got) !== stable(e)) fail(url, `shared entity ${e['@id']} missing or altered`);
  }

  // 3. url == canonical == sitemap loc; name/description == title/meta description
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  const wp = graph.filter((n) => [].concat(n['@type']).some((t) => /^(WebPage|CollectionPage|FAQPage)$/.test(t)));
  if (wp.length !== 1) fail(url, `${wp.length} WebPage nodes, expected 1`);
  else {
    if (wp[0].url !== canonical) fail(url, `WebPage.url ${wp[0].url} != canonical ${canonical}`);
    if (canonical !== url) fail(url, `canonical ${canonical} != the page's own URL ${url}`);
    if (wp[0]['@id'] !== `${canonical}#webpage`) fail(url, `WebPage @id is ${wp[0]['@id']}`);
    const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
    if (decode(title ?? '') !== wp[0].name) fail(url, `WebPage.name != <title>: ${wp[0].name} / ${title}`);
    const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
    if (decode(desc ?? '') !== wp[0].description) fail(url, 'WebPage.description != meta description');
  }
  if (!sitemap.has(url)) fail(url, 'page is not in the sitemap');
}
for (const loc of sitemap) if (!pages.some((p) => p.url === loc)) fail(loc, 'sitemap <loc> has no page with JSON-LD');

if (errors.length) {
  for (const e of errors.slice(0, 40)) console.error(`::error::${e}`);
  if (errors.length > 40) console.error(`... and ${errors.length - 40} more`);
  console.error(`${errors.length} problem(s) in ${pages.length} page(s)`);
  process.exit(1);
}
console.log(`${pages.length} page(s), each with exactly one JSON-LD block; ${crossPage} cross-page @id reference(s) resolved`);
console.log('nodes by type: ' + Object.entries(counts).sort().map(([t, n]) => `${t} ${n}`).join(', '));
