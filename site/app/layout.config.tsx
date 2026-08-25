/**
 * The masthead is the whole navigation apparatus: there is no sidebar tree.
 * 387 rules do not fit in one, and the faceted index plus search do the job
 * a tree would do badly. Nothing here may point at a page that does not
 * exist; a changelog is planned, and so is absent until it is built.
 */
export const SPEC_VERSION = '1.0-draft';

/**
 * The host this site is served from, and the path it is served under.
 *
 * The specification is a subfolder of the brand origin rather than a host of its
 * own. SPEC_BASE_PATH must equal `basePath` in next.config.mjs and the `/spec`
 * prefix in the repository's nginx.conf; scripts/check-schema-published.mjs fails
 * the build if the three ever disagree.
 */
export const SPEC_HOST = 'https://flowdrop.io';
export const SPEC_BASE_PATH = '/spec';

/**
 * Where this site is published, base path included. Only the machine-readable
 * copies use it: a rule's markdown is fetched away from the site and quoted
 * elsewhere, so it has to carry an absolute link back to the rule it came from.
 * Every in-page link stays relative.
 *
 * Everything concatenated onto this is a base-path-less site path (`/rules/x`),
 * because that is what `lib/rules.ts` and fumadocs' `page.url` produce. So the
 * base path is contributed exactly once, by this constant, and `absolute()` in
 * lib/markdown.ts cannot double it.
 */
export const SPEC_ORIGIN = `${SPEC_HOST}${SPEC_BASE_PATH}`;

/**
 * A site path as the browser must request it.
 *
 * Next prepends the base path to its own `<Link>`s, assets and router URLs, and to
 * relative metadata resolved against `metadataBase`. It does not touch a plain
 * `<a href>` or a `fetch()` argument, so those go through here.
 */
export const withBase = (path: string) => `${SPEC_BASE_PATH}${path}`;

export const MASTHEAD_TITLE = 'FlowDrop Workflow Specification';

export const MASTHEAD_LINKS: { text: string; url: string }[] = [
  { text: 'Rules', url: '/rules' },
  { text: 'Conventions', url: '/conventions' },
  { text: 'Glossary', url: '/glossary' },
];

/**
 * The machine-readable corpus, linked from the head of every page so a crawler
 * that never sees the front page still finds it.
 *
 * Next replaces `alternates` wholesale when a page declares its own, rather than
 * merging with the layout's, so any page adding its markdown twin has to carry
 * these along. That is why they live here instead of only in the root layout.
 */
export const MACHINE_ALTERNATES = {
  'text/plain': [{ url: '/llms.txt', title: 'llms.txt: every rule, one line each' }],
  'application/json': [{ url: '/rules.json', title: 'The rule corpus as data' }],
};
