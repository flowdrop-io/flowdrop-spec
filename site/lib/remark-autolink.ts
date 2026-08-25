import { visit, SKIP } from 'unist-util-visit';
import type { Root, Text, PhrasingContent } from 'mdast';
import { segment, termLinker, type Resolver } from './linkify';
import type { TermMatcher } from './glossary';

/**
 * Narrative-MDX half of the autolinker. Runs after the fumadocs preset, so
 * heading ids and the TOC are already assigned.
 *
 * With `terms`, glossary terms are linked too: the first occurrence in the
 * document, outside headings, links and code. The `seen` set is per file, so
 * one compiler instance serves every page.
 */
export function remarkSpecAutolink({ resolve, terms }: { resolve: Resolver; terms?: TermMatcher[] }) {
  return (tree: Root) => {
    const linker = terms ? termLinker(terms) : undefined;

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (parent.type === 'link' || parent.type === 'linkReference') return SKIP;
      // Headings carry ids and the TOC; a term link there would be apparatus in
      // a place the eye uses for navigation.
      const segs = segment(node.value, resolve, parent.type === 'heading' ? undefined : linker);
      if (!segs.some((s) => s.type !== 'text')) return;

      const replacement: PhrasingContent[] = segs.map((s) => {
        if (s.type === 'link') {
          return { type: 'link', url: s.url, children: [{ type: 'text', value: s.value }] };
        }
        if (s.type === 'term') {
          return {
            type: 'link',
            url: s.url,
            // The definition rides in data-def for the CSS tooltip (a native
            // title cannot be themed) and in aria-description for readers.
            data: { hProperties: { className: ['spec-term'], 'data-def': s.title, 'aria-description': s.title } },
            children: [{ type: 'text', value: s.value }],
          };
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
