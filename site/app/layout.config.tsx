/**
 * The top bar and the section strip under it are the whole navigation apparatus:
 * there is no sidebar tree.
 * 387 rules do not fit in one, and the faceted index plus search do the job
 * a tree would do badly. Nothing here may point at a page that does not
 * exist; a changelog is planned, and so is absent until it is built.
 */
export const SPEC_VERSION = '1.0';

/** The day SPEC_VERSION was tagged. Bump the two together. */
export const SPEC_PUBLISHED = '2026-10-25';

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

/**
 * The specification's own destinations, in the strip under the shared top bar. They
 * stay inside this app, so they are router links. The sibling sites (Docs, FlowDrop)
 * are in the bar itself, from the kit.
 */
export const SPEC_SECTIONS: { text: string; url: string }[] = [
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

/**
 * The canonical URL of a page: absolute, base path included, trailing slash
 * (`trailingSlash: true` makes the slash form the only one that answers 200).
 * `path` is a base-path-less site path as `page.url` produces it ('/' or
 * '/rules/x'). It is the same string the sitemap lists.
 */
export const canonicalUrl = (path: string) =>
  `${SPEC_ORIGIN}${path === '/' ? '' : path.replace(/\/$/, '')}/`;

/**
 * Site-wide title and description: the root layout's defaults, the social-card
 * fallback and the front page's own `<title>` (set absolute there, so the template
 * does not repeat the name). They name the version and say "open workflow spec"
 * because that is what people search for; the page's h1 stays plain.
 */
export const SITE_TITLE = `FlowDrop Workflow Specification ${SPEC_VERSION}: an open workflow spec`;
export const SITE_TITLE_TEMPLATE = '%s | FlowDrop Workflow Specification';
export const SITE_DESCRIPTION =
  'An open workflow specification (CC BY 4.0): how a node-based workflow is written, stored, validated and executed, stated independently of any one implementation.';

/**
 * The specification's own card image (1200x630), so a shared link says what it
 * is rather than showing the product card. The one raster asset this site ships;
 * its source is scripts/og/card.html, rendered with headless Chromium. It
 * carries the version and the rule count, so it is redrawn with each release.
 */
export const SOCIAL_IMAGE = `${SPEC_ORIGIN}/og-spec.png`;

/**
 * Open Graph and Twitter tags. Next replaces `openGraph` and `twitter` wholesale
 * when a page declares its own, so every page spreads this rather than relying
 * on the layout's copy. `title` is the page's own title; the site template is
 * applied here because Next does not apply it to social titles.
 */
export function socialMetadata(page?: { title: string; description?: string; path: string }) {
  const title = page && page.path !== '/' ? SITE_TITLE_TEMPLATE.replace('%s', page.title) : SITE_TITLE;
  const description = page?.description ?? SITE_DESCRIPTION;
  return {
    openGraph: {
      type: 'website' as const,
      siteName: 'FlowDrop',
      title,
      description,
      ...(page ? { url: canonicalUrl(page.path) } : {}),
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
