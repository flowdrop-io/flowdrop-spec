/**
 * The rulings corpus: `../rulings/*.yml`.
 *
 * A ruling is the record of a decision about what implementations must do.
 * `conventions.md` and `GOVERNANCE.md` both promise it is carried in the
 * specification itself and referenced from the rules it affects; this loader is
 * what lets the site keep that promise, so a citation is a link to the reasoning
 * rather than a bare identifier.
 *
 * Deliberately independent of `lib/rules.ts`: rules resolve ruling URLs, not the
 * other way round, so there is no cycle. The `affects` list is validated against
 * the citing rules in `scripts/validate-rules.mjs`, not here.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export type Ruling = {
  id: string;
  headline: string;
  question?: string;
  decision: string;
  decided?: string;
  affects: string[];
  supersedes?: string;
  supersededBy?: string;
};

export type LoadedRuling = Ruling & {
  /** URL slug, e.g. `open-19`. */
  slug: string;
  /** Full site URL, e.g. `/rulings/open-19`. */
  url: string;
};

const REPO = path.join(process.cwd(), '..');
const RULINGS_DIR = path.join(REPO, 'rulings');

export const BASE_URL = '/rulings';

const slugify = (id: string) => id.toLowerCase();

let cache: { list: LoadedRuling[]; byId: Map<string, LoadedRuling> } | undefined;

function data() {
  if (cache) return cache;

  const list: LoadedRuling[] = [];
  if (fs.existsSync(RULINGS_DIR)) {
    for (const file of fs.readdirSync(RULINGS_DIR).filter((f) => f.endsWith('.yml'))) {
      const doc = YAML.parse(fs.readFileSync(path.join(RULINGS_DIR, file), 'utf8')) as Ruling;
      const slug = slugify(doc.id);
      list.push({ ...doc, slug, url: `${BASE_URL}/${slug}` });
    }
  }

  // Numeric order, not the lexical order readdir gives: OPEN-2 before OPEN-10.
  list.sort((a, b) => num(a.id) - num(b.id));

  cache = { list, byId: new Map(list.map((r) => [r.id, r])) };
  return cache;
}

const num = (id: string) => Number(id.replace(/^\D+-/, ''));

export function allRulings(): LoadedRuling[] {
  return data().list;
}

export function ruling(id: string): LoadedRuling | undefined {
  return data().byId.get(id);
}

/** The URL for a ruling identifier, or undefined when no ruling carries it. */
export function urlForRuling(id: string): string | undefined {
  return data().byId.get(id)?.url;
}
