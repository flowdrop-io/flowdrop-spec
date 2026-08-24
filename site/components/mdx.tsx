import defaultMdxComponents from 'fumadocs-ui/mdx';

/**
 * Fumadocs' heading component wraps every heading in an anchor plus a
 * copy-link button; here the h2 is a small letterspaced rule-line, and that
 * chrome fights it. The ids are still emitted, so the rail's in-page nav and
 * deep links keep working.
 */
export const mdxComponents = {
  ...defaultMdxComponents,
  h1: (p: React.ComponentProps<'h1'>) => <h1 {...p} />,
  h2: (p: React.ComponentProps<'h2'>) => <h2 {...p} />,
  h3: (p: React.ComponentProps<'h3'>) => <h3 {...p} />,
  h4: (p: React.ComponentProps<'h4'>) => <h4 {...p} />,
  h5: (p: React.ComponentProps<'h5'>) => <h5 {...p} />,
  h6: (p: React.ComponentProps<'h6'>) => <h6 {...p} />,
};
