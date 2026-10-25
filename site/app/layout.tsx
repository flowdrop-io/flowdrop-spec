import type { Metadata } from 'next';
import {
  MACHINE_ALTERNATES,
  SPEC_ORIGIN,
  SITE_TITLE,
  SITE_TITLE_TEMPLATE,
  SITE_DESCRIPTION,
  socialMetadata,
} from '@/app/layout.config';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { RootProvider } from 'fumadocs-ui/provider/next';
import SpecSearchDialog from '@/components/search';
import './global.css';

/**
 * Suisse Int'l, the Factorial face (licensed by Factorial.io), in the two
 * weights the Factorial report look uses: 400 for text and headings, 600 for
 * emphasis. Vendored in brand/fonts/ from the flowdrop-website brand master.
 * `next/font/local` emits them under the basePath with hashed names, so the
 * root-absolute URLs in the master's fonts.css are not needed here.
 */
const suisse = localFont({
  src: [
    { path: '../brand/fonts/SuisseIntl-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../brand/fonts/SuisseIntl-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-suisse',
});

/**
 * Code stays in a real code face. The Suisse Int'l Mono web subset has no
 * `<  >  \  ^  ~` (see brand/tokens.css), so it cannot set JSON or paths.
 * Self-hosted by `next/font/google` at build time; the nginx chart is offline.
 */
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-mono',
});

/**
 * Umami, self-hosted by Factorial. The same website id as flowdrop.io and
 * /docs on purpose: consolidation made these one origin, and Umami keys a
 * site by domain — three ids would split one domain's traffic into three
 * reports that could never be compared, and Umami's default host check
 * would have to be relaxed for each. One report, broken down by path.
 *
 * Cookieless and IP-less; the disclosure lives at flowdrop.io/privacy, which
 * the shared footer links from every page here.
 *
 * Served from `cdn.decasteljau.factorial.io`, not `umami.` — the same
 * instance under a name content blockers do not pattern-match on. Both
 * hostnames return the identical 4,655-byte script and both accept
 * `/api/send`; the collect endpoint follows the script's own origin, so
 * this is the one string that has to change.
 *
 * A plain element, not `next/script`: this site is a static export, and
 * `next/script` only injects the tag after hydration, so the tag is absent
 * from the served HTML and the pageview waits on the client bundle. The
 * website spells it exactly this way.
 */
const UMAMI_WEBSITE_ID = 'd93c0515-ea1e-497d-94ec-669b72d1ba0a';

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SPEC_ORIGIN),
  alternates: { types: MACHINE_ALTERNATES },
  // Defaults for pages that declare none (the 404); every real page overrides.
  ...socialMetadata(),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${suisse.variable} ${plexMono.variable}`}
    >
      <body>
        <RootProvider search={{ SearchDialog: SpecSearchDialog }}>{children}</RootProvider>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          defer
          src="https://cdn.decasteljau.factorial.io/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
        />
      </body>
    </html>
  );
}
