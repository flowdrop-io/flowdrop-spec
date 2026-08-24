import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: {
    default: 'The FlowDrop Workflow Specification',
    template: '%s | FlowDrop Workflow Specification',
  },
  description:
    'The rules a FlowDrop workflow obeys (how a workflow is written, stored, validated and executed), stated independently of any one implementation.',
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
      </body>
    </html>
  );
}
