import fs from 'node:fs';
import path from 'node:path';
import { loader, type StaticSource, type InferPageType } from 'fumadocs-core/source';
import { structure } from 'fumadocs-core/mdx-plugins';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';
import { allFamilies, allRules, urlForId, slugify, type Family, type LoadedRule } from './rules';
import { allRulings, type LoadedRuling } from './rulings';
import { anchoredGlossary } from './glossary';

const REPO = path.join(process.cwd(), '..');
const CONTENT = path.join(process.cwd(), 'content');

export type PageKind =
  | { kind: 'home' }
  | { kind: 'doc'; body: string }
  | { kind: 'rules-index' }
  | { kind: 'family'; family: Family }
  | { kind: 'rule'; rule: LoadedRule }
  | { kind: 'rulings-index' }
  | { kind: 'ruling'; ruling: LoadedRuling };

type PageData = {
  title: string;
  description?: string;
  structuredData?: StructuredData | (() => StructuredData);
} & PageKind;

/** Search text for a rule: the binding sentence and its summary, nothing else. */
function ruleIndex(rule: LoadedRule) {
  return structure([rule.normative, rule.summary].filter(Boolean).join('\n\n'));
}

/** Search text for a ruling: the decision and what it settled. */
function rulingIndex(ruling: LoadedRuling) {
  return structure([ruling.headline, ruling.question, ruling.decision].filter(Boolean).join('\n\n'));
}

/** Listing pages carry no prose of their own; they are found by title alone. */
const EMPTY_INDEX = { headings: [], contents: [] };

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

/** `conventions.md` is spec text and lives at the repo root; strip its H1. */
function conventionsBody() {
  return read(path.join(REPO, 'conventions.md')).replace(/^#\s+.*\n/, '');
}

function glossaryBody() {
  return read(path.join(CONTENT, 'glossary.mdx')).replace(/^#\s+.*\n/, '');
}

function homeBody() {
  return read(path.join(CONTENT, 'index.mdx'));
}

function files() {
  const families = allFamilies();
  const rules = allRules();

  const out: StaticSource<{ pageData: PageData; metaData: Record<string, unknown> }>['files'] = [];

  out.push({
    type: 'meta',
    path: 'meta.json',
    data: {
      title: 'FlowDrop Workflow Specification',
      root: true,
      pages: ['index', 'rules', 'rulings', 'conventions', 'glossary'],
    },
  });

  out.push({
    type: 'page',
    path: 'index.mdx',
    data: {
      kind: 'home',
      title: 'The FlowDrop Workflow Specification',
      description: 'The rules a FlowDrop workflow obeys, stated independently of any one implementation.',
      body: homeBody(),
      structuredData: () => structure(homeBody()),
    } as PageData,
  });

  out.push({
    type: 'page',
    path: 'conventions.mdx',
    data: {
      kind: 'doc',
      title: 'Conventions',
      description: 'Vocabulary and references shared by every rule, stated once.',
      body: conventionsBody(),
      structuredData: () => structure(conventionsBody()),
    } as PageData,
  });

  out.push({
    type: 'page',
    path: 'glossary.mdx',
    data: {
      kind: 'doc',
      title: 'Glossary',
      description: 'The vocabulary the rules are written in.',
      // The page gets anchored entries (`<dfn id>`), so term links land on the
      // definition; the search index keeps the plain source.
      body: anchoredGlossary(glossaryBody()),
      structuredData: () => structure(glossaryBody()),
    } as PageData,
  });

  // Part I families then Part II families, in the order REGISTRY.lock issued them.
  out.push({
    type: 'meta',
    path: 'rules/meta.json',
    data: {
      title: 'Rules',
      pages: ['index', ...families.map((f) => f.slug)],
    },
  });

  out.push({
    type: 'page',
    path: 'rules/index.mdx',
    data: {
      kind: 'rules-index',
      // A filter UI has no prose to index; the rules it lists are indexed themselves.
      structuredData: EMPTY_INDEX,
      title: 'All rules',
      description: `Every rule in the specification, filterable by family, profile, level and posture.`,
    } as PageData,
  });

  for (const family of families) {
    out.push({
      type: 'meta',
      path: `rules/${family.slug}/meta.json`,
      data: {
        title: family.name,
        description: `Part ${family.part}`,
        pages: ['index', ...family.rules.map((r) => r.slug)],
      },
    });

    out.push({
      type: 'page',
      path: `rules/${family.slug}/index.mdx`,
      data: {
        kind: 'family',
        family,
        structuredData: EMPTY_INDEX,
        title: family.name,
        description: `${family.rules.length} rules. Part ${family.part} of the specification.`,
      } as PageData,
    });

    for (const rule of family.rules) {
      out.push({
        type: 'page',
        path: `rules/${family.slug}/${rule.slug}.mdx`,
        data: {
          kind: 'rule',
          rule,
          title: rule.id,
          description: rule.title,
          structuredData: () => ruleIndex(rule),
        } as PageData,
      });
    }
  }

  // Rulings sit beside the rules, not inside them: a ruling is not a requirement
  // and must never read as one, and its identifier lives in its own namespace.
  const rulings = allRulings();

  out.push({
    type: 'meta',
    path: 'rulings/meta.json',
    data: {
      title: 'Rulings',
      pages: ['index', ...rulings.map((r) => r.slug)],
    },
  });

  out.push({
    type: 'page',
    path: 'rulings/index.mdx',
    data: {
      kind: 'rulings-index',
      structuredData: EMPTY_INDEX,
      title: 'Rulings',
      description: `${rulings.length} rulings. What was decided about what implementations must do, and why.`,
    } as PageData,
  });

  for (const ruling of rulings) {
    out.push({
      type: 'page',
      path: `rulings/${ruling.slug}.mdx`,
      data: {
        kind: 'ruling',
        ruling,
        title: ruling.id,
        description: ruling.headline,
        structuredData: () => rulingIndex(ruling),
      } as PageData,
    });
  }

  return out;
}

export const source = loader({
  source: { files: files() } as StaticSource<{ pageData: PageData; metaData: Record<string, unknown> }>,
  baseUrl: '/',
});

export type Page = InferPageType<typeof source>;
export { urlForId, slugify };
