import { createCompiler } from '@fumadocs/mdx-remote';
import { remarkSpecAutolink } from './remark-autolink';
import { urlForId } from './rules';

/**
 * One compiler for the whole build; a fresh `compileMDX()` per page would
 * rebuild the unified processor once per file.
 *
 * The fumadocs preset appends our plugins after its own, so heading ids and the
 * TOC are already assigned when the autolinker runs.
 */
export const compiler = createCompiler({
  remarkPlugins: (v) => [...v, [remarkSpecAutolink, { resolve: urlForId }]],
});
