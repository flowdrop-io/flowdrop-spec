import Link from 'next/link';
import type { TOCItemType } from 'fumadocs-core/toc';
import { ruleById, type LoadedRule, type ReferenceEntry } from '@/lib/rules';
import { Prose } from './prose';
import { RuleBadges } from './badges';

/**
 * The page anatomy is a menu, not a checklist: every section but the normative
 * sentence is optional, and an absent one is omitted entirely — no empty
 * headings. `sections()` is the single place that decides what exists, so the
 * TOC and the body can never disagree.
 */
export function sections(rule: LoadedRule) {
  const refs = [...(rule.references?.normative ?? []), ...(rule.references?.informative ?? [])];
  return {
    summary: Boolean(rule.summary?.trim()),
    narrative: Boolean(rule.narrative?.trim()),
    why: Boolean(rule.rulings?.length),
    references: refs.length > 0,
    related: Boolean(rule.related?.length),
    backlinks: rule.backlinks.length > 0,
  };
}

export function ruleToc(rule: LoadedRule, narrativeToc: TOCItemType[] = []): TOCItemType[] {
  const s = sections(rule);
  const toc: TOCItemType[] = [{ title: 'Normative', url: '#normative', depth: 2 }];
  if (s.summary) toc.push({ title: 'Summary', url: '#summary', depth: 2 });
  if (s.narrative) toc.push(...narrativeToc);
  if (s.why) toc.push({ title: 'Why', url: '#why', depth: 2 });
  if (s.references) toc.push({ title: 'References', url: '#references', depth: 2 });
  if (s.related) toc.push({ title: 'Related rules', url: '#related', depth: 2 });
  if (s.backlinks) toc.push({ title: 'Referenced by', url: '#referenced-by', depth: 2 });
  return toc;
}

function RuleLink({ id }: { id: string }) {
  const target = ruleById(id);
  if (!target) return <span className="spec-ruling">{id}</span>;
  return (
    <Link href={target.url} className="spec-rulecard">
      <span className="spec-rulecard-id">{target.id}</span>
      <span className="spec-rulecard-title">{target.title}</span>
    </Link>
  );
}

function Reference({ entry, binding }: { entry: ReferenceEntry; binding: boolean }) {
  const head = (
    <>
      <span className="spec-ref-source">{entry.source}</span>
      <span className="spec-ref-title">{entry.title}</span>
    </>
  );
  return (
    <li className={binding ? 'spec-ref spec-ref-normative' : 'spec-ref spec-ref-informative'}>
      <span className="spec-ref-kind">{binding ? 'Normative' : 'Informative'}</span>
      {entry.url ? (
        <a href={entry.url} rel="noreferrer noopener" target="_blank">
          {head}
        </a>
      ) : (
        <span>{head}</span>
      )}
      <span className="spec-ref-note">
        <Prose>{entry.note}</Prose>
      </span>
    </li>
  );
}

export function RuleHeader({ rule }: { rule: LoadedRule }) {
  return (
    <>
      <p className="spec-eyebrow not-prose">
        <Link href={`/rules/${rule.family.toLowerCase()}`}>{rule.family}</Link>
        <span aria-hidden> · </span>
        <span>Part {rule.part}</span>
      </p>

      {(rule.posture === 'deprecated' || rule.posture === 'withdrawn') && (
        <div className="spec-callout spec-callout-warn not-prose">
          <strong>This rule is {rule.posture}.</strong> It is kept so it stays citable.
          {rule.supersededBy && (
            <>
              {' '}
              Superseded by <Prose>{rule.supersededBy}</Prose>.
            </>
          )}
        </div>
      )}

      <section id="normative" className="spec-normative not-prose">
        <h2 className="spec-normative-label">Normative</h2>
        <p className="spec-normative-text">
          <Prose>{rule.normative}</Prose>
        </p>
      </section>

      <RuleBadges rule={rule} />
    </>
  );
}

export function RuleBody({ rule, narrative }: { rule: LoadedRule; narrative?: React.ReactNode }) {
  const s = sections(rule);
  return (
    <>
      {s.summary && (
        <section id="summary">
          <h2>Summary</h2>
          <p>
            <Prose>{rule.summary!}</Prose>
          </p>
        </section>
      )}

      {s.narrative && (
        <section className="spec-narrative">
          {rule.narrativeStale && (
            <div className="spec-callout spec-callout-warn not-prose">
              <strong>This prose may be out of date.</strong> The rule&rsquo;s normative text has changed
              since it was written.
            </div>
          )}
          {narrative}
        </section>
      )}

      {s.why && (
        <section id="why">
          <h2>Why</h2>
          <p>
            Recorded under{' '}
            <Prose>{rule.rulings!.join(', ')}</Prose>.
          </p>
        </section>
      )}

      {s.references && (
        <section id="references">
          <h2>References</h2>
          <ul className="spec-refs not-prose">
            {(rule.references?.normative ?? []).map((e, i) => (
              <Reference key={`n${i}`} entry={e} binding />
            ))}
            {(rule.references?.informative ?? []).map((e, i) => (
              <Reference key={`i${i}`} entry={e} binding={false} />
            ))}
          </ul>
        </section>
      )}

      {s.related && (
        <section id="related">
          <h2>Related rules</h2>
          <div className="spec-rulecards not-prose">
            {rule.related!.map((id) => (
              <RuleLink key={id} id={id} />
            ))}
          </div>
        </section>
      )}

      {s.backlinks && (
        <section id="referenced-by">
          <h2>Referenced by</h2>
          <div className="spec-rulecards not-prose">
            {rule.backlinks.map((id) => (
              <RuleLink key={id} id={id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
