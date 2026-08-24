import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { TOCItemType } from 'fumadocs-core/toc';
import { source } from '@/lib/source';
import { compiler } from '@/lib/mdx';
import { allRules } from '@/lib/rules';
import { RuleHeader, RuleBody, ruleToc } from '@/components/rule-page';
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
    title: d.kind === 'rule' ? `${d.title} — ${d.rule!.title}` : d.title,
    description: d.description,
  };
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
      narrativeToc = compiled.toc;
      const Body = compiled.body;
      narrative = <Body components={defaultMdxComponents} />;
    }

    return (
      <DocsPage toc={ruleToc(rule, narrativeToc)} full={false}>
        <DocsTitle>{rule.id}</DocsTitle>
        <DocsDescription>
          <Prose>{rule.title}</Prose>
        </DocsDescription>
        <DocsBody>
          <RuleHeader rule={rule} />
          <RuleBody rule={rule} narrative={narrative} />
        </DocsBody>
      </DocsPage>
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
    return (
      <DocsPage toc={[]} full>
        <DocsTitle>All rules</DocsTitle>
        <DocsDescription>{rules.length} rules, in the order their identifiers were issued.</DocsDescription>
        <DocsBody>
          <Facets rules={rules} />
        </DocsBody>
      </DocsPage>
    );
  }

  if (data.kind === 'family') {
    const family = data.family;
    return (
      <DocsPage toc={[]}>
        <DocsTitle>{family.name}</DocsTitle>
        <DocsDescription>
          {family.rules.length} rules — Part {family.part} of the specification.
        </DocsDescription>
        <DocsBody>
          <ul className="spec-list not-prose">
            {family.rules.map((r: any) => (
              <li key={r.id}>
                <Link href={r.url}>
                  <span className="spec-list-id">{r.id}</span>
                  <span className="spec-list-title">{r.title}</span>
                  <span className="spec-list-meta">{r.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </DocsBody>
      </DocsPage>
    );
  }

  // `home` and `doc` — plain MDX bodies.
  const compiled = await compiler.compile({ source: data.body, filePath: `${page.path}` });
  const Body = compiled.body;
  return (
    <DocsPage toc={compiled.toc}>
      <DocsTitle>{data.title}</DocsTitle>
      {data.description && <DocsDescription>{data.description}</DocsDescription>}
      <DocsBody>
        <Body components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
