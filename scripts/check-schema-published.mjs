#!/usr/bin/env node
/**
 * The rule schema's `$id` is an https URL, so the schema has to be reachable at it.
 *
 * A JSON Schema `$id` is only required to be an identifier, and one that does not
 * resolve is legal. It is still a bad promise: a reader given an https URL will
 * fetch it, and a 404 is indistinguishable from a typo. So the file is published at
 * its identifier — and published means the same bytes, not a reformatted copy, or
 * the document CI validates rule files against and the document implementers read
 * are two different documents that agree today.
 *
 * Checks:
 *   1. rules/schema.json declares the identifier below.
 *   2. The identifier is under the site's own origin and base path.
 *   3. The static export emits that exact file, byte for byte. (Skipped, loudly,
 *      when site/out is absent — the rule-corpus job has no built site.)
 *   4. nginx serves the versioned path and redirects the unversioned one.
 *   5. next.config.mjs, app/layout.config.tsx and nginx.conf agree on the base path.
 *
 * Run: node scripts/check-schema-published.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ORIGIN = 'https://flowdrop.io';
const BASE_PATH = '/spec';
/** The versioned identifier. `1` is this schema's version, not the spec's. */
const SCHEMA_ID = `${ORIGIN}${BASE_PATH}/schema/1/rule.json`;
/** The alias for "current", served as a redirect so there is only one document. */
const UNVERSIONED = `${BASE_PATH}/schema/rule.json`;
/** Where the versioned identifier lands in the export, relative to site/out. */
const EXPORT_PATH = 'schema/1/rule.json';

const problems = [];
const fail = (where, msg) => problems.push({ where, msg });
const read = (p) => readFileSync(join(root, p), 'utf8');

/* ── 1 & 2: the identifier ────────────────────────────────────────────── */

const source = readFileSync(join(root, 'rules/schema.json'));
const declared = JSON.parse(source).$id;

if (declared !== SCHEMA_ID) {
  fail('rules/schema.json', `$id is ${declared ?? 'missing'}, expected ${SCHEMA_ID}`);
}

/* ── 3: the served bytes ──────────────────────────────────────────────── */

const exported = join(root, 'site/out', EXPORT_PATH);

if (!existsSync(join(root, 'site/out'))) {
  console.log('site/out is absent, so the published bytes were not checked. Build the site first.');
} else if (!existsSync(exported)) {
  fail(
    `site/out/${EXPORT_PATH}`,
    `${SCHEMA_ID} is declared but nothing is published there. site/app/schema/1/rule.json/route.ts emits it.`,
  );
} else {
  const served = readFileSync(exported);
  if (!served.equals(source)) {
    fail(
      `site/out/${EXPORT_PATH}`,
      `differs from rules/schema.json (${source.length} bytes at source, ${served.length} served). ` +
        'The published schema must be the file itself, not a re-encoding of it.',
    );
  }
}

/* ── 4: nginx serves both paths ───────────────────────────────────────── */

const nginx = read('nginx.conf');

if (!nginx.includes(`location = ${BASE_PATH}/${EXPORT_PATH}`)) {
  fail('nginx.conf', `no location block serves ${BASE_PATH}/${EXPORT_PATH}`);
}
if (!new RegExp(`location = ${UNVERSIONED}\\s*\\{[^}]*return 30[12] ${BASE_PATH}/${EXPORT_PATH};`).test(nginx)) {
  fail('nginx.conf', `${UNVERSIONED} does not redirect to ${BASE_PATH}/${EXPORT_PATH}`);
}

/* ── 5: one base path, spelled the same in three places ───────────────── */

if (!new RegExp(`basePath: '${BASE_PATH}'`).test(read('site/next.config.mjs'))) {
  fail('site/next.config.mjs', `basePath is not '${BASE_PATH}'`);
}
if (!new RegExp(`SPEC_BASE_PATH = '${BASE_PATH}'`).test(read('site/app/layout.config.tsx'))) {
  fail('site/app/layout.config.tsx', `SPEC_BASE_PATH is not '${BASE_PATH}'`);
}
if (!new RegExp(`SPEC_HOST = '${ORIGIN}'`).test(read('site/app/layout.config.tsx'))) {
  fail('site/app/layout.config.tsx', `SPEC_HOST is not '${ORIGIN}'`);
}
if (!nginx.includes(`location ${BASE_PATH}/ {`)) {
  fail('nginx.conf', `no location block serves ${BASE_PATH}/`);
}

/* ── report ───────────────────────────────────────────────────────────── */

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ${p.where}\n    ${p.msg}\n`);
  process.exit(1);
}

console.log(`${SCHEMA_ID} is published, and ${UNVERSIONED} redirects to it. No problems.`);
