import { specPageGraph } from '@/lib/jsonld/spec';
import { serializeGraph } from '@/lib/jsonld/serialize';

/** The page's one JSON-LD block: shared entities plus the page's own graph. */
export function JsonLd({ page }: { page: Parameters<typeof specPageGraph>[0] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeGraph(specPageGraph(page)) }}
    />
  );
}
