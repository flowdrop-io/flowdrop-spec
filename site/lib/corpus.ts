import type { LoadedRule } from './rules';
import { SPEC_ORIGIN } from '@/app/layout.config';

/** One rule as /rules.json publishes it. The JSON-LD Dataset describes these fields. */
export const ruleRecord = (r: LoadedRule) => ({
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
});
