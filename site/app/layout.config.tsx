/**
 * The masthead is the whole navigation apparatus: there is no sidebar tree.
 * 387 rules do not fit in one, and the faceted index plus search do the job
 * a tree would do badly. Nothing here may point at a page that does not
 * exist; a changelog is planned, and so is absent until it is built.
 */
export const SPEC_VERSION = '1.0-draft';

export const MASTHEAD_TITLE = 'FlowDrop Workflow Specification';

export const MASTHEAD_LINKS: { text: string; url: string }[] = [
  { text: 'Rules', url: '/rules' },
  { text: 'Conventions', url: '/conventions' },
  { text: 'Glossary', url: '/glossary' },
];
