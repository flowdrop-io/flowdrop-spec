import Link from 'next/link';
import { TopBar } from '@/site-kit/components/top-bar';
import { SPEC_SECTIONS } from '@/app/layout.config';
import { SearchButton } from './search-button';
import { ThemeToggle } from './theme-toggle';

/**
 * The shared top bar (D-03) with the specification's own three destinations in a
 * strip beneath it. The bar's Docs / Spec / FlowDrop links name the sites; the strip
 * is the spec's navigation, which has no sidebar tree to carry it.
 */
export function SiteHeader() {
  return (
    <>
      <TopBar
        current="spec"
        skipTo="main"
        wordmark={
          <Link href="/" className="kit-wordmark">
            FlowDrop <em>Spec</em>
          </Link>
        }
        search={<SearchButton />}
        themeToggle={<ThemeToggle />}
      />
      <nav className="spec-sections" aria-label="Specification">
        <div className="spec-sections-inner">
          {SPEC_SECTIONS.map((l) => (
            <Link key={l.url} href={l.url}>
              {l.text}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
