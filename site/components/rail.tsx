import Link from 'next/link';
import type { TOCItemType } from 'fumadocs-core/toc';

/** The rail's masthead: family, the rule identifier at citation size, part. */
export function RailId({
  eyebrow,
  eyebrowHref,
  id,
  part,
  small = false,
}: {
  eyebrow: string;
  eyebrowHref?: string;
  id: string;
  part?: string;
  /** A page title sits in the identifier slot at a calmer size than a rule id. */
  small?: boolean;
}) {
  return (
    <div className="rail-id">
      {eyebrowHref ? (
        <Link className="fam" href={eyebrowHref}>
          {eyebrow}
        </Link>
      ) : (
        <div className="fam">{eyebrow}</div>
      )}
      <div className={small || id.length > 9 ? 'rid long' : 'rid'}>{id}</div>
      {part && <div className="part">{part}</div>}
    </div>
  );
}

/**
 * In-page navigation. Every entry is built from a section that was actually
 * emitted, so the rail can never point at a heading that is not on the page.
 */
export function RailNav({ items }: { items: TOCItemType[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="rail-nav">
      {items.map((i) => (
        <a key={i.url} href={i.url} className={i.depth && i.depth > 2 ? 'depth-3' : undefined}>
          {i.title}
        </a>
      ))}
    </nav>
  );
}

/** What the solid and dotted edges mean. */
export function RailKey() {
  return (
    <div className="key">
      <div>
        <i className="n" aria-hidden />
        <span>Normative — binding</span>
      </div>
      <div>
        <i className="i" aria-hidden />
        <span>Informative — context</span>
      </div>
    </div>
  );
}

export function RailTally({ head, rows }: { head: string; rows: [string, number | string][] }) {
  return (
    <div className="tally">
      <div className="tally-head">{head}</div>
      {rows.map(([label, n]) => (
        <div className="row" key={label}>
          <span>{label}</span>
          <span className="n">{n}</span>
        </div>
      ))}
    </div>
  );
}
