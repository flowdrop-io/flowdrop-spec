import type { MetadataRoute } from 'next';
import { SPEC_HOST, SPEC_ORIGIN } from '@/app/layout.config';

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
 *
 * This file is emitted at /spec/robots.txt, where no crawler looks: robots.txt is
 * only honoured at the origin root, which this site no longer owns. It is kept
 * because it costs nothing and states the intent; the operative copy is the one at
 * https://flowdrop.io/robots.txt.
 *
 * That copy does not name the sitemap below directly, and should not be changed to:
 * it declares https://flowdrop.io/sitemap.xml, a sitemap index which lists this
 * site's sitemap along with the website's and the docs'. The index is the single
 * place that list is maintained.
 */
// Static export: these are files, not handlers.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SPEC_ORIGIN}/sitemap.xml`,
    // `Host` names a hostname, never a URL with a path, so it is the origin and
    // not SPEC_ORIGIN.
    host: SPEC_HOST,
  };
}
