import Link from 'next/link';
import type { TOCItemType } from 'fumadocs-core/toc';
import { ruleById, type LoadedRule, type ReferenceEntry } from '@/lib/rules';
import { SPEC_ORIGIN, SPEC_VERSION, withBase } from '@/app/layout.config';
import { Prose } from './prose';
import { RuleFacets } from './badges';
import { RailId, RailKey, RailNav } from './rail';
import { PageActions } from './page-actions';
import { slugify } from '@/lib/rules';

/**
 * The page anatomy is a menu, not a checklist: every section but the normative
 * sentence is optional, and an absent one is omitted entirely, with no empty
 * headings. `sections()` is the single place that decides what exists, so the
 * rail's in-page nav and the body can never disagree.
 *
 * Most rules carry the normative sentence, a related-rules cluster and nothing
 * else. That page is the design's normal case, not its degenerate one: the rail
 * carries the citation apparatus, the statement carries the weight, and the
 * colophon closes it, so a short page reads as complete rather than unfinished.
 */
export function sections(rule: LoadedRule) {
  const refs = [...(rule.references?.normative ?? []), ...(rule.references?.informative ?? [])];
  return {
    summary: Boolean(rule.summary?.trim()),
    narrative: Boolean(rule.narrative?.trim()),
    why: Boolean(rule.rulings?.length),
    references: refs.length > 0,
    related: Boolean(rule.related?.length) || rule.backlinks.length > 0,
  };
}

/**
 * The one narrative in the corpus writes its own "Why" heading. When it does,
 * the rulings section keeps its own anchor so the two never collide, and only
 * the prose one is offered in the rail.
 */
function narrativeOwnsWhy(rule: LoadedRule, narrativeToc: TOCItemType[]): boolean {
  return (
    Boolean(rule.narrative?.trim()) &&
    narrativeToc.some((i) => i.url === '#why')
  );
}

export function ruleToc(rule: LoadedRule, narrativeToc: TOCItemType[] = []): TOCItemType[] {
  const s = sections(rule);
  const toc: TOCItemType[] = [{ title: 'The rule', url: '#rule', depth: 2 }];
  if (s.narrative) toc.push(...narrativeToc);
  if (s.why && !narrativeOwnsWhy(rule, narrativeToc)) toc.push({ title: 'Why', url: '#why', depth: 2 });
  if (s.references) toc.push({ title: 'References', url: '#references', depth: 2 });
  if (s.related) toc.push({ title: 'Related rules', url: '#related', depth: 2 });
  return toc;
}

function RuleChip({ id }: { id: string }) {
  const target = ruleById(id);
  if (!target) return <span className="rulechip">{id}</span>;
  return (
    <Link href={target.url} className="rulechip" title={target.title}>
      {target.id}
    </Link>
  );
}

function Reference({ entry }: { entry: ReferenceEntry }) {
  const title = entry.url ? (
    <a href={entry.url} rel="noreferrer noopener" target="_blank">
      {entry.title}
    </a>
  ) : (
    entry.title
  );
  return (
    <li>
      <span className="refsrc">{entry.source}</span>
      <span className="reftitle">{title}</span>
      <span className="refnote">
        <Prose>{entry.note}</Prose>
      </span>
    </li>
  );
}

/** The rail: family, identifier, part, facets, in-page nav, and the key. */
export function RuleRail({ rule, toc }: { rule: LoadedRule; toc: TOCItemType[] }) {
  return (
    <>
      <RailId
        eyebrow={rule.family}
        eyebrowHref={`/rules/${rule.family.toLowerCase()}`}
        id={rule.id}
        part={`Part ${rule.part} of the specification`}
      />
      <RuleFacets rule={rule} />
      <RailNav items={toc} />
      <PageActions
        mdPath={withBase(`/llms/${slugify(rule.family)}/${rule.slug}.md`)}
        citeUrl={`${SPEC_ORIGIN}${rule.url}.md`}
        askAbout={`${rule.id} of the FlowDrop Workflow Specification. Quote the normative sentence before answering.`}
      />
      <RailKey />
    </>
  );
}

export function RuleDoc({
  rule,
  narrative,
  narrativeToc = [],
}: {
  rule: LoadedRule;
  narrative?: React.ReactNode;
  narrativeToc?: TOCItemType[];
}) {
  const s = sections(rule);
  const whyId = narrativeOwnsWhy(rule, narrativeToc) ? 'rulings' : 'why';

  return (
    <>
      <h1>
        <Prose>{rule.title}</Prose>
      </h1>
      {s.summary && (
        <p className="standfirst">
          <Prose>{rule.summary!}</Prose>
        </p>
      )}

      <section id="rule">
        <h2>The rule</h2>

        <div className="normative">
          <span className="label">
            <b>Normative</b>: this is the rule
          </span>
          <p className="statement">
            <Prose>{rule.normative}</Prose>
          </p>
        </div>

        {rule.posture !== 'normative-target' && (
          <div className="supersedes">
            <span className="stamp">{rule.posture}</span>
            {rule.posture === 'descriptive' ? (
              <>This rule records what implementations do rather than requiring it.</>
            ) : (
              <>This rule is kept so it stays citable.</>
            )}
            {rule.supersededBy && (
              <p>
                Superseded by <Prose>{rule.supersededBy}</Prose>.
              </p>
            )}
          </div>
        )}
      </section>

      {s.narrative && (
        <>
          {rule.narrativeStale && (
            <p className="stale">
              <b>This prose may be out of date.</b> The rule&rsquo;s normative text has changed since it
              was written.
            </p>
          )}
          {narrative}
        </>
      )}

      {s.why && (
        <section id={whyId}>
          <h2>Why</h2>
          <p>
            Recorded under <Prose>{rule.rulings!.join(', ')}</Prose>.
          </p>
        </section>
      )}

      {s.references && (
        <section id="references">
          <h2>References</h2>
          {(rule.references?.normative ?? []).length > 0 && (
            <div className="refgroup norm">
              <h3>
                <b>Normative</b>: incorporated into this rule
              </h3>
              <ul className="reflist">
                {rule.references!.normative!.map((e, i) => (
                  <Reference key={`n${i}`} entry={e} />
                ))}
              </ul>
            </div>
          )}
          {(rule.references?.informative ?? []).length > 0 && (
            <div className="refgroup info">
              <h3>Further reading</h3>
              <ul className="reflist">
                {rule.references!.informative!.map((e, i) => (
                  <Reference key={`i${i}`} entry={e} />
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {s.related && (
        <section id="related">
          <h2>Related rules</h2>

          {Boolean(rule.related?.length) && (
            <div className="chipgroup">
              <h3>
                Related <span>(rules this one names)</span>
              </h3>
              <div className="chips">
                {rule.related!.map((id) => (
                  <RuleChip key={id} id={id} />
                ))}
              </div>
            </div>
          )}

          {rule.backlinks.length > 0 && (
            <div className="chipgroup">
              <h3>
                Referenced by <span>(rules that name this one)</span>
              </h3>
              <div className="chips">
                {rule.backlinks.map((id) => (
                  <RuleChip key={id} id={id} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="colophon">
        <span>
          Rule identifiers are permanent and are never renumbered. Each implementation publishes its own
          standing against these rules; this specification does not.
        </span>
        <span className="mono">
          spec {SPEC_VERSION} · {rule.id} · changed in spec {rule.changed}
        </span>
      </div>
    </>
  );
}
