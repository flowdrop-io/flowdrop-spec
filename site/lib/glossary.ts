import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

/**
 * The glossary as data: one entry per `- **Term**:` bullet in
 * content/glossary.mdx, with a slug that doubles as the entry's anchor on the
 * glossary page, and the small set of terms the site links automatically
 * (content/glossary-links.yml).
 *
 * Linking is opt-in per term and constrained by a pattern, not derived from
 * the entry list: "node" appears in 219 rules and "error" in 76, and a page
 * carpeted in definition links buries the identifier links that carry the
 * spec's actual cross-references. See the sidecar's header for the policy.
 */

/** Site-relative; next/link and the MDX anchor both add the base path. */
export const GLOSSARY_URL = '/glossary';

const CONTENT = path.join(process.cwd(), 'content');
const GLOSSARY = path.join(CONTENT, 'glossary.mdx');
const LINKS = path.join(CONTENT, 'glossary-links.yml');

export type GlossaryEntry = { term: string; slug: string; definition: string };

export type TermMatcher = { slug: string; url: string; title: string; re: RegExp };

// A definition runs to the next bullet, blank line or heading, or the end of
// the file; `(?![\s\S])` is end-of-file, since with the `m` flag `$` would stop
// at the entry's first line break.
const ENTRY = /^- \*\*(.+?)\*\*:\s*([\s\S]*?)(?=\n- \*\*|\n\n|\n#|(?![\s\S]))/gm;

/** "Pipeline / job" → pipeline; "Launch-input manifest (`input_ports`)" → launch-input-manifest. */
export function termSlug(term: string): string {
  return term
    .split(/\s*[/(]\s*/)[0]
    .replace(/`/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The first sentence of a definition, unwrapped and stripped of markdown, for a link's title. */
function firstSentence(md: string): string {
  const flat = md.replace(/\s+/g, ' ').replace(/\*\*?|`/g, '').trim();
  const m = /^.*?[.!?](?=\s|$)/.exec(flat);
  return (m ? m[0] : flat).trim();
}

let entries: GlossaryEntry[] | undefined;

export function glossaryEntries(): GlossaryEntry[] {
  if (entries) return entries;
  const raw = fs.readFileSync(GLOSSARY, 'utf8');
  entries = [...raw.matchAll(ENTRY)].map((m) => ({
    term: m[1],
    slug: termSlug(m[1]),
    definition: m[2].trim(),
  }));
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.slug)) throw new Error(`glossary: two entries slug to "${e.slug}"`);
    seen.add(e.slug);
  }
  return entries;
}

/**
 * Gives every entry its anchor: `- **Term**:` becomes `- <dfn id="slug">Term</dfn>:`.
 * Applied to the body the glossary page renders, not to the search index or
 * the markdown twin, which keep the plain source.
 */
export function anchoredGlossary(body: string): string {
  return body.replace(/^- \*\*(.+?)\*\*:/gm, (_, term: string) => `- <dfn id="${termSlug(term)}">${term}</dfn>:`);
}

let matchers: TermMatcher[] | undefined;

export function termMatchers(glossaryUrl: string): TermMatcher[] {
  if (matchers) return matchers;
  const bySlug = new Map(glossaryEntries().map((e) => [e.slug, e]));
  const links = (YAML.parse(fs.readFileSync(LINKS, 'utf8')) ?? {}) as Record<string, { match: string }>;
  matchers = Object.entries(links).map(([slug, cfg]) => {
    const entry = bySlug.get(slug);
    if (!entry) throw new Error(`glossary-links.yml: "${slug}" has no glossary entry`);
    if (!cfg?.match) throw new Error(`glossary-links.yml: "${slug}" has no match pattern`);
    return {
      slug,
      url: `${glossaryUrl}#${slug}`,
      title: firstSentence(entry.definition),
      re: new RegExp(`\\b(?:${cfg.match})\\b`, 'gi'),
    };
  });
  return matchers;
}
