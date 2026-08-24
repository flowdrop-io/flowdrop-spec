import type { MetadataRoute } from 'next';
import { allFamilies, allRules } from '@/lib/rules';
import { SPEC_ORIGIN } from '@/app/layout.config';

/**
 * Every page a reader should be able to reach. The markdown twins are not listed:
 * they are alternate representations of these same pages, declared per page with
 * `rel="alternate"`, and listing both would ask a crawler to index one document
 * twice.
 */
// Static export: these are files, not handlers.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (url: string, priority: number) => ({
    url: `${SPEC_ORIGIN}${url}`,
    changeFrequency: 'weekly' as const,
    priority,
  });

  return [
    at('/', 1),
    at('/rules', 0.9),
    at('/conventions', 0.8),
    at('/glossary', 0.7),
    ...allFamilies().map((f) => at(f.url, 0.6)),
    ...allRules().map((r) => at(r.url, 0.5)),
  ];
}
