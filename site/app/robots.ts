import type { MetadataRoute } from 'next';
import { SPEC_ORIGIN } from '@/app/layout.config';

/**
 * Everything is allowed, deliberately.
 *
 * The specification is CC BY 4.0 and exists to be read, quoted and implemented;
 * a rule nobody can find is a rule nobody conforms to. That includes crawlers
 * that feed models, which is the same reason the markdown twins and llms.txt
 * exist — refusing them here while publishing llms.txt would be incoherent.
 *
 * /llms/ is not disallowed but is not advertised either: those files are the
 * storage behind the `.md` URLs, and the sitemap lists the pages themselves.
 */
// Static export: these are files, not handlers.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SPEC_ORIGIN}/sitemap.xml`,
    host: SPEC_ORIGIN,
  };
}
