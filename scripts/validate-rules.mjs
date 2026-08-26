#!/usr/bin/env node
/**
 * Validates the rule corpus. Run with --update-hashes to rewrite narrative
 * frontmatter hashes after a deliberate change to a rule's normative text.
 *
 * Checks:
 *   1. Every rule file parses and satisfies rules/schema.json.
 *   2. A rule's filename matches its id.
 *   3. Identifiers are unique.
 *   4. Identifiers agree with REGISTRY.lock: none vanished, none renumbered,
 *      none added without being recorded, and none reserved yet used.
 *   5. `related` points at rules that exist.
 *   6. Every cited ruling exists, and every ruling's `affects` list agrees with
 *      the rules that cite it, in both directions.
 *   7. Narrative prose has not drifted from the rule text it explains.
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
const rulingsDir = join(root, 'rulings');
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
  // An identifier may contain a slash (R7.e/f), which no filename can carry.
  // The file is named for the id with slashes replaced by a hyphen; the id itself
  // is never rewritten, because identifiers are permanent.
  const fileFor = (id) => `${id.replace(/\//g, '-')}.yml`;
  if (file !== fileFor(doc.id)) fail(`rules/${file}`, `filename should be ${fileFor(doc.id)}`);
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
  lock.set(id, {
    family,
    withdrawn: flags.includes('withdrawn'),
    reserved: flags.includes('reserved'),
  });
}

for (const [id, entry] of lock) {
  const rule = rules.get(id);
  // A reserved identifier is one this specification has ruled out of its scope while
  // another document still uses it. It is blocked, not issued: it must have no rule
  // file, and it can never be handed to a different rule later.
  if (entry.reserved) {
    if (rule) {
      fail(`rules/${id}.yml`, `${id} is reserved in REGISTRY.lock and must not have a rule file. Reserving an identifier blocks it permanently; issue a new one instead.`);
    }
    continue;
  }
  if (!rule) {
    fail('rules/REGISTRY.lock', `${id} is recorded as issued but has no rule file. Identifiers are permanent: withdraw the rule, do not delete it.`);
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

/* ── 3b. rulings ──────────────────────────────────────────────────────── */

/*
 * conventions.md and GOVERNANCE.md both promise that a ruling is carried in the
 * specification itself and referenced from the rules it affects. Nothing checked
 * that, and for a while it was false: 16 rulings were cited and none existed here,
 * so every citation rendered as a bare marker and two contributors wrote `## Why`
 * prose paraphrasing a ruling they could not read. These checks are what make the
 * promise enforceable rather than aspirational.
 */

const rulings = new Map();
if (!existsSync(rulingsDir)) {
  fail('rulings/', 'directory is missing; rulings are carried in the specification itself');
} else {
  for (const file of readdirSync(rulingsDir).filter((f) => f.endsWith('.yml'))) {
    let doc;
    try {
      doc = parseYaml(readFileSync(join(rulingsDir, file), 'utf8'));
    } catch (err) {
      fail(`rulings/${file}`, `does not parse: ${err.message}`);
      continue;
    }
    if (!doc?.id) {
      fail(`rulings/${file}`, 'has no id');
      continue;
    }
    if (file !== `${doc.id}.yml`) fail(`rulings/${file}`, `filename should be ${doc.id}.yml`);
    if (rulings.has(doc.id)) fail(`rulings/${file}`, `duplicate id ${doc.id}`);
    rulings.set(doc.id, doc);
  }

  const validateRuling = ajv.compile(
    JSON.parse(readFileSync(join(rulingsDir, 'schema.json'), 'utf8')),
  );
  for (const [id, doc] of rulings) {
    if (!validateRuling(doc)) {
      for (const e of validateRuling.errors) {
        fail(`rulings/${id}.yml`, `${e.instancePath || '/'} ${e.message}`);
      }
    }
  }

  // The lockfile carries the same permanence guarantee as REGISTRY.lock. A
  // reserved identifier is one another document already issued: blocked here, so
  // the two corpora can never disagree about what OPEN-11 means.
  const rlockPath = join(rulingsDir, 'RULINGS.lock');
  const rlock = new Map();
  for (const line of readFileSync(rlockPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [id, ...flags] = t.split(/\s+/);
    rlock.set(id, { reserved: flags.includes('reserved') });
  }
  for (const [id, entry] of rlock) {
    if (entry.reserved) {
      if (rulings.has(id)) {
        fail(`rulings/${id}.yml`, `${id} is reserved in RULINGS.lock and must not have a ruling file`);
      }
      continue;
    }
    if (!rulings.has(id)) {
      fail('rulings/RULINGS.lock', `${id} is recorded as issued but has no ruling file. A ruling is history: supersede it, do not delete it.`);
    }
  }
  for (const id of rulings.keys()) {
    if (!rlock.has(id)) {
      fail('rulings/RULINGS.lock', `${id} exists but is not recorded. Add "${id}" in the same commit.`);
    }
  }

  // Both directions. A rule citing a ruling that does not exist is the original
  // defect; a ruling claiming a rule that does not cite it is the same drift
  // pointing the other way, and is just as misleading to a reader.
  const citedBy = new Map();
  for (const [id, doc] of rules) {
    for (const ref of doc.rulings ?? []) {
      if (!rulings.has(ref)) {
        fail(`rules/${id}.yml`, `cites ruling ${ref}, which has no file in rulings/. A ruling is carried in the specification itself, not in an implementation's notes.`);
        continue;
      }
      if (!citedBy.has(ref)) citedBy.set(ref, new Set());
      citedBy.get(ref).add(id);
    }
  }
  for (const [id, doc] of rulings) {
    const actual = citedBy.get(id) ?? new Set();
    for (const ref of doc.affects ?? []) {
      if (!rules.has(ref)) fail(`rulings/${id}.yml`, `affects ${ref}, which is not a rule`);
      else if (!actual.has(ref)) fail(`rulings/${id}.yml`, `affects ${ref}, but ${ref} does not cite ${id}`);
    }
    for (const ref of actual) {
      if (!(doc.affects ?? []).includes(ref)) {
        fail(`rulings/${id}.yml`, `${ref} cites ${id}, but ${id} does not list it in affects`);
      }
    }
    if (doc.supersedes && !rulings.has(doc.supersedes)) {
      fail(`rulings/${id}.yml`, `supersedes ${doc.supersedes}, which does not exist`);
    }
    if (doc.supersededBy && !rulings.has(doc.supersededBy)) {
      fail(`rulings/${id}.yml`, `supersededBy ${doc.supersededBy}, which does not exist`);
    }
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
      fail(`narrative/${file}`, `rule_hash is ${front.rule_hash ?? 'missing'}, expected ${expected}. ${id}'s normative text changed, so this prose may no longer match it. Re-read it, then run: npm run hashes`);
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

const reserved = [...lock.values()].filter((e) => e.reserved).length;
console.log(
  `${rules.size} rule(s) validated, ${lock.size - reserved} identifier(s) issued, ` +
    `${reserved} reserved; ${rulings.size} ruling(s). No problems.`,
);
