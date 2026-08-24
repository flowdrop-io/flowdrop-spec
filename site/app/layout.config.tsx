/**
 * The masthead is the whole navigation apparatus: there is no sidebar tree.
 * 387 rules do not fit in one, and the faceted index plus search do the job
 * a tree would do badly. Nothing here may point at a page that does not
 * exist; a changelog is planned, and so is absent until it is built.
 */
export const SPEC_VERSION = '1.0-draft';

/**
 * Where this site is published. Only the machine-readable copies use it: a rule's
 * markdown is fetched away from the site and quoted elsewhere, so it has to carry an
 * absolute link back to the rule it came from. Every in-page link stays relative.
 */
export const SPEC_ORIGIN = 'https://spec.flowdrop.io';

export const MASTHEAD_TITLE = 'FlowDrop Workflow Specification';

export const MASTHEAD_LINKS: { text: string; url: string }[] = [
  { text: 'Rules', url: '/rules' },
  { text: 'Conventions', url: '/conventions' },
  { text: 'Glossary', url: '/glossary' },
];
