import { SHARED_ENTITIES, type Node } from './shared';

/**
 * One graph per page. `<`, `>`, `&` and the two line separators are escaped so
 * that rule text containing `</script>` cannot close the tag; the escapes are
 * valid JSON and parse back to the same characters.
 */
export function serializeGraph(nodes: Node[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [...SHARED_ENTITIES, ...nodes] })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
