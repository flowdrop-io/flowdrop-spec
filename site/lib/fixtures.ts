/**
 * The fixtures corpus: `../fixtures/<suite>/<case>.json`.
 *
 * A fixture is a test case an implementation can run. It names the rules that
 * decide its outcome; each of those rules' pages lists it. Shape and rule ids are
 * checked in `scripts/validate-rules.mjs`, not here.
 */
import fs from 'node:fs';
import path from 'node:path';

export type Fixture = {
  title: string;
  rules: string[];
  operation: string;
  note?: string;
  given: Record<string, unknown>;
  expect: Record<string, unknown>;
};

export type LoadedFixture = Fixture & {
  /** `presence/cfg-wire-null-beats-config`: the suite and the file name. */
  id: string;
  suite: string;
  /** Path in the repository, e.g. `fixtures/presence/out-unbound-absent.json`. */
  file: string;
};

const REPO = path.join(process.cwd(), '..');
const FIXTURES_DIR = path.join(REPO, 'fixtures');

let cache: Map<string, LoadedFixture[]> | undefined;

function build(): Map<string, LoadedFixture[]> {
  const byRule = new Map<string, LoadedFixture[]>();
  if (!fs.existsSync(FIXTURES_DIR)) return byRule;
  const suites = fs
    .readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const suite of suites) {
    const files = fs
      .readdirSync(path.join(FIXTURES_DIR, suite))
      .filter((f) => f.endsWith('.json'))
      .sort();
    for (const f of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, suite, f), 'utf8'));
      const { $schema: _, ...doc } = raw as Fixture & { $schema?: string };
      const name = f.replace(/\.json$/, '');
      const fixture: LoadedFixture = { ...doc, id: `${suite}/${name}`, suite, file: `fixtures/${suite}/${f}` };
      for (const rule of fixture.rules) {
        if (!byRule.has(rule)) byRule.set(rule, []);
        byRule.get(rule)!.push(fixture);
      }
    }
  }
  return byRule;
}

/** The fixtures that name a rule, by suite and then file name. */
export function fixturesFor(ruleId: string): LoadedFixture[] {
  if (!cache) cache = build();
  return cache.get(ruleId) ?? [];
}
