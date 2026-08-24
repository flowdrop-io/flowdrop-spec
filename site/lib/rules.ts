import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import YAML from 'yaml';

export type ReferenceEntry = {
  source: string;
  title: string;
  url?: string;
  note: string;
};

export type Rule = {
  id: string;
  family: string;
  part: 'I' | 'II';
  title: string;
  summary?: string;
  normative: string;
  posture: 'normative-target' | 'descriptive' | 'deprecated' | 'withdrawn';
  level: 'core' | 'extended' | 'optional';
  profiles: ('runtime' | 'storage-api' | 'editor-client')[];
  added: string;
  changed: string;
  rulings?: string[];
  related?: string[];
  references?: { normative?: ReferenceEntry[]; informative?: ReferenceEntry[] };
  supersededBy?: string;
};

export type LoadedRule = Rule & {
  /** URL slug for this rule, e.g. `r7-e-f`. */
  slug: string;
  /** Full site URL, e.g. `/rules/gr-store/store-2`. */
  url: string;
  /** Rules that name this one in their `related` list. */
  backlinks: string[];
  /** Raw narrative MDX body, if `narrative/<id>.mdx` exists. */
  narrative?: string;
  /** True when the narrative's `rule_hash` no longer matches `normative`. */
  narrativeStale?: boolean;
};

export type Family = {
  name: string;
  part: 'I' | 'II';
  slug: string;
  url: string;
  rules: LoadedRule[];
};

const REPO = path.join(process.cwd(), '..');
const RULES_DIR = path.join(REPO, 'rules');
const NARRATIVE_DIR = path.join(REPO, 'narrative');
const LOCK = path.join(RULES_DIR, 'REGISTRY.lock');

export const BASE_URL = '/rules';

export function slugify(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** sha256(normative, whitespace-collapsed).slice(0,12); matches scripts/validate-rules.mjs. */
function ruleHash(normative: string): string {
  return createHash('sha256')
    .update(normative.trim().replace(/\s+/g, ' '))
    .digest('hex')
    .slice(0, 12);
}

/** Family order and, within a family, rule order, as issued in REGISTRY.lock. */
function registryOrder(): { families: string[]; ids: string[] } {
  const families: string[] = [];
  const ids: string[] = [];
  for (const line of fs.readFileSync(LOCK, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [id, family] = t.split(/\s+/);
    if (!id || !family) continue;
    ids.push(id);
    if (!families.includes(family)) families.push(family);
  }
  return { families, ids };
}

function readNarrative(id: string): { body: string; hash?: string } | undefined {
  const file = path.join(NARRATIVE_DIR, `${id.replace(/\//g, '-')}.mdx`);
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, 'utf8');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!m) return { body: raw };
  const front = YAML.parse(m[1]) ?? {};
  return { body: raw.slice(m[0].length), hash: front.rule_hash };
}

let cache: { rules: LoadedRule[]; byId: Map<string, LoadedRule>; families: Family[] } | undefined;

function build() {
  const { families: familyOrder, ids: idOrder } = registryOrder();

  const raw: Rule[] = fs
    .readdirSync(RULES_DIR)
    .filter((f) => f.endsWith('.yml'))
    .map((f) => YAML.parse(fs.readFileSync(path.join(RULES_DIR, f), 'utf8')) as Rule);

  // Backlinks: who names me in `related`.
  const backlinks = new Map<string, string[]>();
  for (const r of raw) {
    for (const other of r.related ?? []) {
      if (!backlinks.has(other)) backlinks.set(other, []);
      backlinks.get(other)!.push(r.id);
    }
  }

  const rules: LoadedRule[] = raw.map((r) => {
    const slug = slugify(r.id);
    const narr = readNarrative(r.id);
    return {
      ...r,
      slug,
      url: `${BASE_URL}/${slugify(r.family)}/${slug}`,
      backlinks: (backlinks.get(r.id) ?? []).sort(byRegistry(idOrder)),
      narrative: narr?.body,
      narrativeStale: narr ? narr.hash !== ruleHash(r.normative) : undefined,
    };
  });

  // Slug collisions would silently drop pages, so fail the build instead.
  const seen = new Map<string, string>();
  for (const r of rules) {
    const key = `${r.family}/${r.slug}`;
    if (seen.has(key)) throw new Error(`slug collision: ${r.id} and ${seen.get(key)} both map to ${key}`);
    seen.set(key, r.id);
  }

  const byId = new Map(rules.map((r) => [r.id, r]));

  const famNames = [
    ...familyOrder.filter((f) => rules.some((r) => r.family === f)),
    ...[...new Set(rules.map((r) => r.family))].filter((f) => !familyOrder.includes(f)).sort(),
  ];

  const families: Family[] = famNames.map((name) => {
    const members = rules.filter((r) => r.family === name).sort((a, b) => byRegistry(idOrder)(a.id, b.id));
    return {
      name,
      part: members[0].part,
      slug: slugify(name),
      url: `${BASE_URL}/${slugify(name)}`,
      rules: members,
    };
  });

  return { rules, byId, families };
}

function byRegistry(idOrder: string[]) {
  const rank = new Map(idOrder.map((id, i) => [id, i]));
  return (a: string, b: string) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9) || a.localeCompare(b);
}

function data() {
  if (!cache) cache = build();
  return cache;
}

export const allRules = (): LoadedRule[] => data().rules;
export const allFamilies = (): Family[] => data().families;
export const ruleById = (id: string): LoadedRule | undefined => data().byId.get(id);

/**
 * The one authority on "does this identifier have a page?". Rule identifiers
 * resolve to their rule page; a family name (`GR-EDGE`, `RT-CMP`) resolves to
 * the family index. Anything else (a ruling, `ISO-8601`, `JSON`) resolves to
 * nothing, and the caller renders it as text or as a marker.
 */
export function urlForId(id: string): string | undefined {
  const d = data();
  const rule = d.byId.get(id);
  if (rule) return rule.url;
  return d.families.find((f) => f.name === id)?.url;
}

export const FAMILY_LABEL = (family: string) => family.replace(/^(GR|RT)-/, '');
