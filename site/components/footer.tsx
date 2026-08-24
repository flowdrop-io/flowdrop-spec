import Link from 'next/link';
import { SPEC_VERSION } from '@/app/layout.config';

/**
 * The machine-readable corpus, as links rather than only as `<link rel=alternate>`
 * in the head: a crawler follows anchors reliably and head links inconsistently,
 * and a person looking for the data should not have to read the source to find it.
 */
export function Footer() {
  return (
    <footer className="siteftr">
      <div className="siteftr-inner">
        <p>
          <span className="mono">spec {SPEC_VERSION}</span> · The specification text is licensed{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" rel="license noreferrer" target="_blank">
            CC BY 4.0
          </a>
          . Cite a rule by its identifier; identifiers are permanent.
        </p>
        <nav aria-label="Machine-readable">
          <span>For a machine:</span>
          <a href="/llms.txt">llms.txt</a>
          <a href="/llms-full.txt">llms-full.txt</a>
          <a href="/rules.json">rules.json</a>
          <Link href="/conventions.md">markdown</Link>
        </nav>
      </div>
    </footer>
  );
}
