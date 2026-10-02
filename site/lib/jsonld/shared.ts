import shared from './shared-entities.json';

/**
 * Entities every page of flowdrop.io carries, unchanged: Factorial (the publisher,
 * under Factorial's own @id so search engines merge it with the one factorial.io
 * declares) and the WebSite. `shared-entities.json` is copied byte-identical into
 * the website, docs and spec repositories; change all three together.
 * scripts/check-jsonld.mjs fails the build if what a page emits differs from it.
 */
export type Node = Record<string, unknown>;
export type Ref = { '@id': string };

export const SHARED_ENTITIES = shared.entities as Node[];

export const ORGANIZATION: Ref = { '@id': 'https://www.factorial.io/#organization' };
export const WEBSITE: Ref = { '@id': 'https://flowdrop.io/#website' };
export const SOFTWARE: Ref = { '@id': 'https://flowdrop.io/#software' };

/** Defined on /spec/ by this repository. */
export const SPEC_ID = 'https://flowdrop.io/spec/#spec';
export const DATASET_ID = 'https://flowdrop.io/spec/#dataset';
export const GLOSSARY_TERMS_ID = 'https://flowdrop.io/spec/glossary/#terms';
export const SPEC: Ref = { '@id': SPEC_ID };

export const CC_BY = 'https://creativecommons.org/licenses/by/4.0/';
