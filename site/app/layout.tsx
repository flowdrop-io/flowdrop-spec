import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import SpecSearchDialog from '@/components/search';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'The FlowDrop Workflow Specification',
    template: '%s — FlowDrop Workflow Specification',
  },
  description:
    'The rules a FlowDrop workflow obeys — how a workflow is written, stored, validated and executed — stated independently of any one implementation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider search={{ SearchDialog: SpecSearchDialog }}>{children}</RootProvider>
      </body>
    </html>
  );
}
