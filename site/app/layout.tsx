import type { Metadata } from 'next';
import { MACHINE_ALTERNATES, SPEC_ORIGIN } from '@/app/layout.config';
import { Spectral, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import SpecSearchDialog from '@/components/search';
import './global.css';

/**
 * The three faces of the prototype, self-hosted. `next/font/google` downloads
 * and emits them at build time, so the deployed site never reaches out to
 * fonts.googleapis.com, because the nginx chart it ships in is offline.
 */
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-spectral',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-sans',
});

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
    default: 'The FlowDrop Workflow Specification',
    template: '%s | FlowDrop Workflow Specification',
  },
  description:
    'The rules a FlowDrop workflow obeys (how a workflow is written, stored, validated and executed), stated independently of any one implementation.',
  metadataBase: new URL(SPEC_ORIGIN),
  alternates: { types: MACHINE_ALTERNATES },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spectral.variable} ${plexSans.variable} ${plexMono.variable}`}
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
