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
 * Fumadocs' heading component wraps every heading in an anchor plus a
 * copy-link button; here the h2 is a small letterspaced rule-line, and that
 * chrome fights it. The ids are still emitted, so the rail's in-page nav and
 * deep links keep working.
 */
export const mdxComponents = {
  ...defaultMdxComponents,
  Callout,
  h1: (p: React.ComponentProps<'h1'>) => <h1 {...p} />,
  h2: (p: React.ComponentProps<'h2'>) => <h2 {...p} />,
  h3: (p: React.ComponentProps<'h3'>) => <h3 {...p} />,
  h4: (p: React.ComponentProps<'h4'>) => <h4 {...p} />,
  h5: (p: React.ComponentProps<'h5'>) => <h5 {...p} />,
  h6: (p: React.ComponentProps<'h6'>) => <h6 {...p} />,
};
