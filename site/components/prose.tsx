import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { inlineChunks, segment, type TermLinker } from '@/lib/linkify';
import { urlForId } from '@/lib/rules';

const resolve = (id: string) => urlForId(id);

/**
 * Renders a YAML prose string: inline code spans, plus the ID autolinker.
 * This prose never passes through remark, so it calls the shared matcher
 * directly (see lib/linkify.ts).
 *
 * Pass `terms` to also link glossary terms. Only the normative statement does;
 * a title, standfirst or reference note carrying definition links would put
 * the apparatus in front of the text.
 */
export function Prose({
  children,
  className,
  terms,
}: {
  children: string;
  className?: string;
  terms?: TermLinker;
}) {
  return <span className={className}>{render(children, terms)}</span>;
}

export function render(text: string, terms?: TermLinker): ReactNode {
  return inlineChunks(text).map((chunk, i) => {
    if (chunk.code) {
      return (
        <code key={i} className="fd-code">
          {chunk.value}
        </code>
      );
    }
    return (
      <Fragment key={i}>
        {segment(chunk.value, resolve, terms).map((s, j) => {
          if (s.type === 'link')
            return (
              <Link key={j} href={s.url} className="spec-idlink">
                {s.value}
              </Link>
            );
          if (s.type === 'term')
            return (
              <Link key={j} href={s.url} className="spec-term" data-def={s.title} aria-description={s.title}>
                {s.value}
              </Link>
            );
          if (s.type === 'marker')
            return (
              <span key={j} className="spec-ruling" title="A recorded ruling. Rulings do not have their own pages yet.">
                {s.value}
              </span>
            );
          return <Fragment key={j}>{s.value}</Fragment>;
        })}
      </Fragment>
    );
  });
}
