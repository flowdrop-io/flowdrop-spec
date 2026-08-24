import { allFamilies, allRules, reservedIds, FAMILY_LABEL, slugify } from '@/lib/rules';
import { SPEC_ORIGIN, SPEC_VERSION } from '@/app/layout.config';

/**
 * The corpus as data, for a reader that wants to compute over it rather than read
 * it: a conformance harness, a coverage report, an editor resolving an identifier.
 *
 * Everything a rule file carries is here, plus what only the site knows — the
 * page URL, the markdown twin, and backlinks. Reserved identifiers are included
 * because "MIG-1 is not ours" is a different answer from "MIG-1 is unknown", and a
 * tool cannot distinguish them otherwise.
 */

export const dynamic = 'force-static';
export const revalidate = false;

export function GET() {
  const rules = allRules();
  const families = allFamilies();

  const body = {
    specification: 'FlowDrop Workflow Specification',
    version: SPEC_VERSION,
    source: SPEC_ORIGIN,
    licence: 'CC-BY-4.0',
    generated: 'from rules/*.yml — do not edit, and do not treat as the source of truth',
    counts: {
      rules: rules.length,
      families: families.length,
      reserved: reservedIds().length,
    },
    families: families.map((f) => ({
      name: f.name,
      label: FAMILY_LABEL(f.name),
      part: f.part,
      url: `${SPEC_ORIGIN}${f.url}`,
      rules: f.rules.map((r) => r.id),
    })),
    rules: rules.map((r) => ({
      id: r.id,
      family: r.family,
      part: r.part,
      title: r.title,
      summary: r.summary,
      normative: r.normative,
      posture: r.posture,
      level: r.level,
      profiles: r.profiles,
      added: r.added,
      changed: r.changed,
      rulings: r.rulings,
      related: r.related,
      backlinks: r.backlinks,
      references: r.references,
      supersededBy: r.supersededBy,
      url: `${SPEC_ORIGIN}${r.url}`,
      markdown: `${SPEC_ORIGIN}${r.url}.md`,
    })),
    reserved: reservedIds().map((r) => ({
      ...r,
      note: 'declined by this specification; in use in an implementation registry. Never issued here.',
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
