import { allFamilies, allRules } from '@/lib/rules';
import { glossaryEntries, GLOSSARY_URL } from '@/lib/glossary';
import { ruleRecord } from '@/lib/corpus';
import {
  SITE_TITLE_TEMPLATE,
  SOCIAL_IMAGE,
  SPEC_ORIGIN,
  SPEC_VERSION,
  canonicalUrl,
} from '@/app/layout.config';
import {
  CC_BY,
  DATASET_ID,
  GLOSSARY_TERMS_ID,
  ORGANIZATION,
  SOFTWARE,
  SPEC,
  SPEC_ID,
  WEBSITE,
  type Node,
  type Ref,
} from './shared';

/**
 * The JSON-LD graph of every page of the specification, generated from the same
 * data the page renders (`lib/source.ts`: rules/*.yml, rulings/*.yml, the
 * glossary), never from HTML and never written by hand per page. Every URL is
 * `canonicalUrl()`, the helper the canonical link and the sitemap use.
 */

const HOME = 'https://flowdrop.io/';
const ref = (id: string): Ref => ({ '@id': id });

type PageLike = { url: string; data: unknown };
type Data = {
  kind: 'home' | 'doc' | 'rules-index' | 'family' | 'rule' | 'rulings-index' | 'ruling';
  title: string;
  description?: string;
  family?: { name: string; part: string; url: string; rules: { id: string; url: string }[] };
  rule?: { id: string; title: string; normative: string; level: string; family: string; url: string };
  ruling?: { id: string; headline: string; decided?: string };
};

/** The page's `<title>`: the same string `generateMetadata` hands Next, template applied. */
export function pageTitle(kind: Data['kind'], title: string, rule?: { title: string }): string {
  return SITE_TITLE_TEMPLATE.replace('%s', kind === 'rule' ? `${title}: ${rule!.title}` : title);
}

/** Markdown and inline code stripped, for a field that must read as plain text. */
function plain(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g, (_, a, b, c) => a ?? b ?? c)
    .replace(/\s+/g, ' ')
    .trim();
}

const articleId = (path: string) => `${canonicalUrl(path)}#article`;

function breadcrumb(path: string, trail: { name: string; path: string }[]): Node {
  const items = [
    { name: 'Home', url: HOME },
    { name: 'Specification', url: canonicalUrl('/') },
    ...trail.map((t) => ({ name: t.name, url: canonicalUrl(t.path) })),
  ];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl(path)}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

function webPage(
  path: string,
  name: string,
  description: string,
  extra: Node & { collection?: boolean; crumbs?: boolean } = {},
): Node {
  const { collection, crumbs = true, ...rest } = extra;
  const canonical = canonicalUrl(path);
  return {
    '@type': collection ? 'CollectionPage' : 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name,
    description,
    isPartOf: WEBSITE,
    inLanguage: 'en',
    ...(crumbs ? { breadcrumb: ref(`${canonical}#breadcrumb`) } : {}),
    primaryImageOfPage: { '@type': 'ImageObject', url: SOCIAL_IMAGE, width: 1200, height: 630 },
    ...rest,
  };
}

const media = (contentUrl: string, encodingFormat: string): Node => ({
  '@type': 'MediaObject',
  contentUrl,
  encodingFormat,
});

function specGraph(path: string, name: string, description: string): Node[] {
  const families = allFamilies();
  const rules = allRules();
  const fields = Object.keys(ruleRecord(rules[0]));
  return [
    webPage(path, name, description, { about: SPEC, mainEntity: ref(SPEC_ID), crumbs: false }),
    {
      '@type': 'CreativeWork',
      '@id': SPEC_ID,
      name: 'The FlowDrop Workflow Specification',
      description,
      url: canonicalUrl('/'),
      version: SPEC_VERSION,
      // The README and the home page both state it: a draft, not yet published.
      creativeWorkStatus: 'Draft',
      license: CC_BY,
      inLanguage: 'en',
      publisher: ORGANIZATION,
      copyrightHolder: ORGANIZATION,
      about: SOFTWARE,
      sameAs: 'https://github.com/flowdrop-io/flowdrop-spec',
      mainEntityOfPage: ref(`${canonicalUrl(path)}#webpage`),
      hasPart: families.map((f) => ref(articleId(f.url))),
      encoding: [
        media(`${SPEC_ORIGIN}/rules.json`, 'application/json'),
        media(`${SPEC_ORIGIN}/llms-full.txt`, 'text/plain'),
        media(`${SPEC_ORIGIN}/llms.txt`, 'text/plain'),
      ],
    },
    {
      '@type': 'Dataset',
      '@id': DATASET_ID,
      name: 'FlowDrop Workflow Specification — rule corpus',
      description: `All ${rules.length} rules of the FlowDrop Workflow Specification in ${families.length} families, as machine-readable data (rules.json) and as one plain-text document (llms-full.txt). Generated from the rule files; the rule files are the source of truth.`,
      url: canonicalUrl('/'),
      license: CC_BY,
      version: SPEC_VERSION,
      inLanguage: 'en',
      creator: ORGANIZATION,
      publisher: ORGANIZATION,
      isBasedOn: SPEC,
      // The fields of one rule record in rules.json, taken from the code that writes it.
      variableMeasured: fields.map((f) => ({ '@type': 'PropertyValue', name: f })),
      distribution: [
        {
          '@type': 'DataDownload',
          contentUrl: `${SPEC_ORIGIN}/rules.json`,
          encodingFormat: 'application/json',
        },
        {
          '@type': 'DataDownload',
          contentUrl: `${SPEC_ORIGIN}/llms-full.txt`,
          encodingFormat: 'text/plain',
        },
      ],
    },
  ];
}

function familyGraph(path: string, name: string, description: string, f: NonNullable<Data['family']>): Node[] {
  const position = allFamilies().findIndex((x) => x.name === f.name) + 1;
  return [
    webPage(path, name, description, {
      collection: true,
      about: ref(articleId(path)),
      mainEntity: ref(articleId(path)),
    }),
    breadcrumb(path, [{ name: 'Rules', path: '/rules' }, { name: f.name, path }]),
    {
      '@type': 'CreativeWork',
      '@id': articleId(path),
      identifier: f.name,
      name: f.name,
      description,
      url: canonicalUrl(path),
      isPartOf: SPEC,
      position,
      inLanguage: 'en',
      license: CC_BY,
      publisher: ORGANIZATION,
      copyrightHolder: ORGANIZATION,
      mainEntityOfPage: ref(`${canonicalUrl(path)}#webpage`),
      hasPart: f.rules.map((r) => ref(articleId(r.url))),
    },
  ];
}

function ruleGraph(path: string, name: string, description: string, r: NonNullable<Data['rule']>): Node[] {
  const family = allFamilies().find((f) => f.name === r.family)!;
  return [
    webPage(path, name, description, { about: ref(articleId(path)), mainEntity: ref(articleId(path)) }),
    breadcrumb(path, [
      { name: 'Rules', path: '/rules' },
      { name: family.name, path: family.url },
      { name: `${r.id}: ${r.title}`, path },
    ]),
    {
      '@type': 'CreativeWork',
      '@id': articleId(path),
      identifier: r.id,
      name: r.title,
      text: r.normative,
      url: canonicalUrl(path),
      isPartOf: ref(articleId(family.url)),
      keywords: r.level,
      inLanguage: 'en',
      license: CC_BY,
      publisher: ORGANIZATION,
      copyrightHolder: ORGANIZATION,
      mainEntityOfPage: ref(`${canonicalUrl(path)}#webpage`),
      encoding: media(`${SPEC_ORIGIN}${r.url}.md`, 'text/markdown'),
    },
  ];
}

function techArticle(path: string, headline: string, description: string, extra: Node = {}): Node {
  return {
    '@type': 'TechArticle',
    '@id': articleId(path),
    headline,
    description,
    url: canonicalUrl(path),
    isPartOf: SPEC,
    inLanguage: 'en',
    publisher: ORGANIZATION,
    mainEntityOfPage: ref(`${canonicalUrl(path)}#webpage`),
    ...extra,
  };
}

function glossaryGraph(path: string, name: string, description: string): Node[] {
  const set = canonicalUrl(path);
  const entries = glossaryEntries();
  return [
    webPage(path, name, description, { about: ref(GLOSSARY_TERMS_ID), mainEntity: ref(GLOSSARY_TERMS_ID) }),
    breadcrumb(path, [{ name: 'Glossary', path }]),
    {
      '@type': 'DefinedTermSet',
      '@id': GLOSSARY_TERMS_ID,
      name: 'FlowDrop Workflow Specification glossary',
      description,
      url: set,
      inLanguage: 'en',
      isPartOf: SPEC,
      publisher: ORGANIZATION,
      hasDefinedTerm: entries.map((e) => ref(`${set}#${e.slug}`)),
    },
    ...entries.map(
      (e): Node => ({
        '@type': 'DefinedTerm',
        '@id': `${set}#${e.slug}`,
        // The anchor `anchoredGlossary()` gives the entry on the page.
        url: `${canonicalUrl(GLOSSARY_URL)}#${e.slug}`,
        name: plain(e.term),
        description: plain(e.definition),
        inDefinedTermSet: ref(GLOSSARY_TERMS_ID),
      }),
    ),
  ];
}

/** The graph (without the shared entities) for one page, by the kind `lib/source.ts` gives it. */
export function specPageGraph(page: PageLike): Node[] {
  const path = page.url;
  const d = page.data as Data;
  const name = pageTitle(d.kind, d.title, d.rule);
  const description = d.description ?? '';

  switch (d.kind) {
    case 'home':
      return specGraph(path, name, description);
    case 'rules-index':
      return [
        webPage(path, name, description, { collection: true, about: SPEC }),
        breadcrumb(path, [{ name: 'Rules', path }]),
      ];
    case 'family':
      return familyGraph(path, name, description, d.family!);
    case 'rule':
      return ruleGraph(path, name, description, d.rule!);
    case 'rulings-index':
      return [
        webPage(path, name, description, { collection: true, about: SPEC }),
        breadcrumb(path, [{ name: 'Rulings', path }]),
      ];
    case 'ruling': {
      const r = d.ruling!;
      return [
        webPage(path, name, description, { about: ref(articleId(path)), mainEntity: ref(articleId(path)) }),
        breadcrumb(path, [{ name: 'Rulings', path: '/rulings' }, { name: `${r.id}: ${r.headline}`, path }]),
        techArticle(path, `${r.id}: ${r.headline}`, description, {
          identifier: r.id,
          ...(r.decided ? { dateCreated: r.decided } : {}),
        }),
      ];
    }
    case 'doc':
      if (path === '/glossary') return glossaryGraph(path, name, description);
      return [
        webPage(path, name, description, { about: ref(articleId(path)), mainEntity: ref(articleId(path)) }),
        breadcrumb(path, [{ name: d.title, path }]),
        techArticle(path, d.title, description),
      ];
  }
}
