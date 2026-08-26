import Link from 'next/link';
import { Prose } from '@/components/prose';
import { RailId, RailNav } from '@/components/rail';
import type { TOCItemType } from 'fumadocs-core/toc';
import { urlForId } from '@/lib/rules';
import type { LoadedRuling } from '@/lib/rulings';

/**
 * A ruling's page. Deliberately plainer than a rule's: a ruling is a short,
 * immutable record of one decision, so there is nothing to fold, filter or
 * version, and no implementation status of any kind belongs here.
 */

export function rulingToc(ruling: LoadedRuling): TOCItemType[] {
  const items: TOCItemType[] = [];
  if (ruling.question) items.push({ title: 'What was open', url: '#question', depth: 2 });
  items.push({ title: 'Decision', url: '#decision', depth: 2 });
  items.push({ title: 'Rules affected', url: '#affects', depth: 2 });
  return items;
}

export function RulingRail({ ruling, toc }: { ruling: LoadedRuling; toc: TOCItemType[] }) {
  return (
    <>
      <RailId eyebrow="Ruling" eyebrowHref="/rulings" id={ruling.id} part={ruling.decided} />
      <RailNav items={toc} />
    </>
  );
}

export function RulingDoc({ ruling }: { ruling: LoadedRuling }) {
  return (
    <>
      <h1>{ruling.id}</h1>
      <p className="standfirst">
        <Prose>{ruling.headline}</Prose>
      </p>

      {ruling.supersededBy && (
        <p className="stale">
          <b>Superseded by {ruling.supersededBy}.</b> A ruling is never rewritten; this one stands as
          it was written and a later one takes its place.
        </p>
      )}

      {ruling.question && (
        <section id="question">
          <h2>What was open</h2>
          <p>
            <Prose>{ruling.question}</Prose>
          </p>
        </section>
      )}

      <section id="decision">
        <h2>Decision</h2>
        <p>
          <Prose>{ruling.decision}</Prose>
        </p>
        {ruling.supersedes && (
          <p>
            Supersedes <Link href={`/rulings/${ruling.supersedes.toLowerCase()}`}>{ruling.supersedes}</Link>.
          </p>
        )}
      </section>

      <section id="affects">
        <h2>Rules affected</h2>
        <ul className="spec-list">
          {ruling.affects.map((id) => (
            <li key={id}>
              <Link href={urlForId(id) ?? '/rules'}>
                <span className="spec-list-id">{id}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
