import { visit, SKIP } from 'unist-util-visit';
import type { Root, Text, PhrasingContent } from 'mdast';
import { segment, type Resolver } from './linkify';

/**
 * Narrative-MDX half of the autolinker. Runs after the fumadocs preset, so
 * heading ids and the TOC are already assigned.
 */
export function remarkSpecAutolink({ resolve }: { resolve: Resolver }) {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (parent.type === 'link' || parent.type === 'linkReference') return SKIP;

      const segs = segment(node.value, resolve);
      if (!segs.some((s) => s.type !== 'text')) return;

      const replacement: PhrasingContent[] = segs.map((s) => {
        if (s.type === 'link') {
          return { type: 'link', url: s.url, children: [{ type: 'text', value: s.value }] };
        }
        if (s.type === 'marker') {
          // A ruling has no page. Mark it the same way <Prose> does, never link it.
          return {
            type: 'mdxJsxTextElement',
            name: 'span',
            attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'spec-ruling' }],
            children: [{ type: 'text', value: s.value }],
          } as unknown as PhrasingContent;
        }
        return { type: 'text', value: s.value };
      });

      parent.children.splice(index, 1, ...replacement);
      return [SKIP, index + replacement.length];
    });
  };
}
