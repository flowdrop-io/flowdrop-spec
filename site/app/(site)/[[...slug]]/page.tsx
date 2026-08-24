import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { mdxComponents } from '@/components/mdx';
import type { TOCItemType } from 'fumadocs-core/toc';
import { source } from '@/lib/source';
import { compiler } from '@/lib/mdx';
import { allRules, allFamilies } from '@/lib/rules';
import { SPEC_VERSION } from '@/app/layout.config';
import { Shell } from '@/components/shell';
import { RailId, RailNav, RailTally } from '@/components/rail';
import { RuleDoc, RuleRail, ruleToc } from '@/components/rule-page';
import { Facets, type FacetRule } from '@/components/facets';
import { Prose } from '@/components/prose';

export function generateStaticParams() {
  return source.generateParams();
}

export const dynamicParams = false;

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const page = source.getPage((await props.params).slug);
  if (!page) return {};
  const d = page.data as { kind: string; title: string; description?: string; rule?: { title: string } };
  return {
    title: d.kind === 'rule' ? `${d.title}: ${d.rule!.title}` : d.title,
    description: d.description,
  };
}

/** Only depth-2 and depth-3 headings belong in the rail. */
function railItems(toc: TOCItemType[]): TOCItemType[] {
  return toc.filter((i) => (i.depth ?? 2) <= 3);
}

function tally<T>(items: T[], pick: (t: T) => string): [string, number][] {
  const m = new Map<string, number>();
  for (const i of items) m.set(pick(i), (m.get(pick(i)) ?? 0) + 1);
  return [...m.entries()];
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const page = source.getPage((await props.params).slug);
  if (!page) notFound();
  const data = page.data as any;

  if (data.kind === 'rule') {
    const rule = data.rule;
    let narrative: React.ReactNode = null;
    let narrativeToc: TOCItemType[] = [];

    if (rule.narrative) {
      const compiled = await compiler.compile({ source: rule.narrative, filePath: `narrative/${rule.id}.mdx` });
      narrativeToc = railItems(compiled.toc);
      const Body = compiled.body;
      narrative = <Body components={mdxComponents} />;
    }

    const toc = ruleToc(rule, narrativeToc);

    return (
      <Shell rail={<RuleRail rule={rule} toc={toc} />}>
        <RuleDoc rule={rule} narrative={narrative} narrativeToc={narrativeToc} />
      </Shell>
    );
  }

  if (data.kind === 'rules-index') {
    const rules: FacetRule[] = allRules().map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      family: r.family,
      part: r.part,
      level: r.level,
      posture: r.posture,
      profiles: r.profiles,
    }));
    const parts = tally(rules, (r) => r.part).sort();
    const rail = (
      <>
        <RailId
          eyebrow="All rules"
          id={String(rules.length)}
          part="rules, in the order their identifiers were issued"
        />
        <RailTally
          head="Corpus"
          rows={[
            ['Families', allFamilies().length],
            ...parts.map(([p, n]) => [`Part ${p}`, n] as [string, number]),
          ]}
        />
      </>
    );
    return (
      <Shell rail={rail} wide>
        <h1>All rules</h1>
        <p className="standfirst">
          Every rule in the specification, filterable by family, profile, level and posture. An
          identifier is permanent: never renumbered, never reused.
        </p>
        <Facets rules={rules} />
      </Shell>
    );
  }

  if (data.kind === 'family') {
    const family = data.family;
    const levels = tally<{ level: string }>(family.rules, (r) => r.level);
    const postures = tally<{ posture: string }>(family.rules, (r) => r.posture).filter(
      ([p]) => p !== 'normative-target',
    );
    const rail = (
      <>
        <RailId
          eyebrow="Family"
          eyebrowHref="/rules"
          id={family.name}
          part={`Part ${family.part} of the specification`}
        />
        <RailTally
          head="Levels"
          rows={[['Rules', family.rules.length], ...levels] as [string, number][]}
        />
        {postures.length > 0 && <RailTally head="Postures" rows={postures as [string, number][]} />}
      </>
    );
    return (
      <Shell rail={rail}>
        <h1>{family.name}</h1>
        <p className="standfirst">
          {family.rules.length} rules. Part {family.part} of the specification.
        </p>
        <ul className="spec-list">
          {family.rules.map((r: any) => (
            <li key={r.id}>
              <Link href={r.url}>
                <span className="spec-list-id">{r.id}</span>
                <span className="spec-list-title">
                  <Prose>{r.title}</Prose>
                </span>
                <span className="spec-list-meta">{r.level}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Shell>
    );
  }

  // `home` and `doc`: plain MDX bodies.
  const compiled = await compiler.compile({ source: data.body, filePath: `${page.path}` });
  const Body = compiled.body;
  const rail = (
    <>
      <RailId
        eyebrow="Specification"
        id={data.kind === 'home' ? SPEC_VERSION : data.title}
        part={data.description}
        small={data.kind !== 'home'}
      />
      <RailNav items={railItems(compiled.toc)} />
      {data.kind === 'home' && (
        <RailTally
          head="Corpus"
          rows={[
            ['Rules', allRules().length],
            ['Families', allFamilies().length],
          ]}
        />
      )}
    </>
  );
  return (
    <Shell rail={rail}>
      <h1>{data.title}</h1>
      {data.description && data.kind !== 'home' && <p className="standfirst">{data.description}</p>}
      <Body components={mdxComponents} />
    </Shell>
  );
}
