import defaultMdxComponents from 'fumadocs-ui/mdx';

type CalloutType = 'info' | 'note' | 'tip' | 'success' | 'warn' | 'warning' | 'error';

/**
 * Fumadocs' callout is a card: pill cornering, a drop shadow and a lucide
 * glyph, none of which this typographic palette owns. This is the same
 * notice device as `.stale` and the `.supersedes` stamp — a wash, a rule,
 * and a letterspaced mono label.
 */
function Callout({
  title,
  type = 'info',
  children,
  ...rest
}: React.ComponentProps<'aside'> & { title?: React.ReactNode; type?: CalloutType }) {
  return (
    <aside className={`callout callout-${type}`} {...rest}>
      {title && <p className="callout-title">{title}</p>}
      {children}
    </aside>
  );
}

/**
 * A worked exchange: the request below, and above it what was sent and what
 * came back. The verdict is authored as `"400 refused"` or `"201 stored"`;
 * the status class digit decides its colour, so a 2xx reads as accepted and a
 * 4xx/5xx as refused without the author naming either.
 *
 * `title` and `verdict` arrive as `<pre>` props from the meta string (see
 * lib/mdx.ts). A fence with neither is an ordinary code block and falls back
 * to fumadocs' CodeBlock, so conventions and glossary prose is unaffected.
 */
function Pre({
  title,
  verdict,
  children,
  ...rest
}: React.ComponentProps<'pre'> & { title?: string; verdict?: string; allowCopy?: string }) {
  if (!title && !verdict) {
    const Default = defaultMdxComponents.pre!;
    return <Default title={title} {...rest}>{children}</Default>;
  }
  const { allowCopy: _drop, ...preProps } = rest;
  const m = verdict ? /^\s*(\d{3})\s*(?:[—–-]\s*)?(.*)$/.exec(verdict) : null;
  const status = m?.[1];
  const outcome = m?.[2] ?? verdict;
  const tone = status ? (status.startsWith('2') ? 'yes' : 'no') : undefined;
  return (
    <figure className="exchange">
      <figcaption>
        <span>{title}</span>
        {verdict && (
          <span className={tone ? `verdict ${tone}` : 'verdict'}>
            {status ? `${status} — ${outcome}` : outcome}
          </span>
        )}
      </figcaption>
      <pre {...preProps}>{children}</pre>
    </figure>
  );
}

/**
 * Fumadocs' heading component wraps every heading in an anchor plus a
 * copy-link button; here the h2 is a small letterspaced rule-line, and that
 * chrome fights it. The ids are still emitted, so the rail's in-page nav and
 * deep links keep working.
 */
export const mdxComponents = {
  ...defaultMdxComponents,
  Callout,
  pre: Pre,
  h1: (p: React.ComponentProps<'h1'>) => <h1 {...p} />,
  h2: (p: React.ComponentProps<'h2'>) => <h2 {...p} />,
  h3: (p: React.ComponentProps<'h3'>) => <h3 {...p} />,
  h4: (p: React.ComponentProps<'h4'>) => <h4 {...p} />,
  h5: (p: React.ComponentProps<'h5'>) => <h5 {...p} />,
  h6: (p: React.ComponentProps<'h6'>) => <h6 {...p} />,
};
