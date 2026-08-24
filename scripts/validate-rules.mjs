#!/usr/bin/env node
/**
 * Validates the rule corpus. Run with --update-hashes to rewrite narrative
 * frontmatter hashes after a deliberate change to a rule's normative text.
 *
 * Checks:
 *   1. Every rule file parses and satisfies rules/schema.json.
 *   2. A rule's filename matches its id.
 *   3. Identifiers are unique.
 *   4. Identifiers agree with REGISTRY.lock — none vanished, none renumbered,
 *      none added without being recorded.
 *   5. `related` points at rules that exist.
 *   6. Narrative prose has not drifted from the rule text it explains.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rulesDir = join(root, 'rules');
const narrativeDir = join(root, 'narrative');
const updateHashes = process.argv.includes('--update-hashes');

const problems = [];
const fail = (where, msg) => problems.push({ where, msg });

export const ruleHash = (normative) =>
  createHash('sha256').update(normative.trim().replace(/\s+/g, ' ')).digest('hex').slice(0, 12);

/* ── load ─────────────────────────────────────────────────────────────── */

const files = readdirSync(rulesDir).filter((f) => f.endsWith('.yml'));
if (files.length === 0) fail('rules/', 'no rule files found');

const rules = new Map();
for (const file of files) {
  let doc;
  try {
    doc = parseYaml(readFileSync(join(rulesDir, file), 'utf8'));
  } catch (err) {
    fail(`rules/${file}`, `does not parse: ${err.message}`);
    continue;
  }
  if (!doc?.id) {
    fail(`rules/${file}`, 'has no id');
    continue;
  }
  if (file !== `${doc.id}.yml`) fail(`rules/${file}`, `filename should be ${doc.id}.yml`);
  if (rules.has(doc.id)) fail(`rules/${file}`, `duplicate id ${doc.id}`);
  rules.set(doc.id, doc);
}

/* ── 1. schema ────────────────────────────────────────────────────────── */

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(readFileSync(join(rulesDir, 'schema.json'), 'utf8')));

for (const [id, doc] of rules) {
  if (!validate(doc)) {
    for (const e of validate.errors) fail(`rules/${id}.yml`, `${e.instancePath || '/'} ${e.message}`);
  }
}

/* ── 2. the permanence guarantee ──────────────────────────────────────── */

const lockPath = join(rulesDir, 'REGISTRY.lock');
const lock = new Map();
for (const line of readFileSync(lockPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const [id, family, ...flags] = t.split(/\s+/);
  lock.set(id, { family, withdrawn: flags.includes('withdrawn') });
}

for (const [id, entry] of lock) {
  const rule = rules.get(id);
  if (!rule) {
    fail('rules/REGISTRY.lock', `${id} is recorded as issued but has no rule file. Identifiers are permanent — withdraw the rule, do not delete it.`);
    continue;
  }
  if (rule.family !== entry.family) {
    fail(`rules/${id}.yml`, `family changed from ${entry.family} to ${rule.family}. An identifier does not move between families.`);
  }
  if (entry.withdrawn && rule.posture !== 'withdrawn') {
    fail(`rules/${id}.yml`, `REGISTRY.lock marks ${id} withdrawn but posture is "${rule.posture}"`);
  }
}
for (const id of rules.keys()) {
  if (!lock.has(id)) {
    fail('rules/REGISTRY.lock', `${id} exists but is not recorded. Add "${id} ${rules.get(id).family}" in the same commit.`);
  }
}

/* ── 3. cross-references ──────────────────────────────────────────────── */

for (const [id, doc] of rules) {
  for (const ref of doc.related ?? []) {
    if (ref === id) fail(`rules/${id}.yml`, 'lists itself as related');
    else if (!rules.has(ref) && !lock.has(ref)) fail(`rules/${id}.yml`, `related rule ${ref} does not exist`);
  }
  if (doc.supersededBy && !rules.has(doc.supersededBy)) {
    fail(`rules/${id}.yml`, `supersededBy ${doc.supersededBy} does not exist`);
  }
}

/* ── 4. narrative drift ───────────────────────────────────────────────── */

let rewritten = 0;
if (existsSync(narrativeDir)) {
  for (const file of readdirSync(narrativeDir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(narrativeDir, file);
    const raw = readFileSync(path, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
    if (!m) {
      fail(`narrative/${file}`, 'has no frontmatter');
      continue;
    }
    const front = parseYaml(m[1]) ?? {};
    const id = front.rule ?? basename(file, '.mdx');
    const rule = rules.get(id);
    if (!rule) {
      fail(`narrative/${file}`, `describes ${id}, which has no rule file`);
      continue;
    }
    const expected = ruleHash(rule.normative);
    if (front.rule_hash === expected) continue;

    if (updateHashes) {
      writeFileSync(path, raw.replace(/^(---\n[\s\S]*?rule_hash:\s*)\S+/m, `$1${expected}`));
      rewritten++;
    } else {
      fail(`narrative/${file}`, `rule_hash is ${front.rule_hash ?? 'missing'}, expected ${expected} — ${id}'s normative text changed, so this prose may no longer match it. Re-read it, then run: npm run hashes`);
    }
  }
}

/* ── report ───────────────────────────────────────────────────────────── */

if (rewritten) console.log(`updated ${rewritten} narrative hash(es)`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ${p.where}\n    ${p.msg}\n`);
  process.exit(1);
}

console.log(`${rules.size} rule(s) validated, ${lock.size} identifier(s) issued. No problems.`);
