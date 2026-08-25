import { createCompiler } from '@fumadocs/mdx-remote';
import { parseCodeBlockAttributes, rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { remarkSpecAutolink } from './remark-autolink';
import { urlForId } from './rules';
import { GLOSSARY_URL, termMatchers } from './glossary';

/**
 * A worked exchange is a fenced block with a caption and a verdict:
 *
 *     ```http title="Creating a workflow with no name" verdict="400 refused"
 *
 * Fumadocs' default meta parser knows `title`; this one adds `verdict`, which
 * shiki copies onto the `<pre>` like any other meta key, and the `pre`
 * component in components/mdx.tsx turns the pair into a `figure.exchange`.
 * Blocks with neither stay ordinary code blocks.
 */
function parseMetaString(meta: string) {
  const parsed = parseCodeBlockAttributes(meta, ['title', 'verdict', 'noCopy']);
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.attributes)) {
    if (k === 'noCopy') data.allowCopy = 'false';
    else data[k] = v;
  }
  data.__raw = parsed.rest;
  return data;
}

/**
 * One compiler for the whole build; a fresh `compileMDX()` per page would
 * rebuild the unified processor once per file.
 *
 * The fumadocs preset appends our plugins after its own, so heading ids and the
 * TOC are already assigned when the autolinker runs.
 */
export const compiler = createCompiler({
  remarkPlugins: (v) => [...v, [remarkSpecAutolink, { resolve: urlForId, terms: termMatchers(GLOSSARY_URL) }]],
  rehypeCodeOptions: { ...rehypeCodeDefaultOptions, parseMetaString },
});
