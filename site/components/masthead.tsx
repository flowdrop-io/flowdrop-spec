import Link from 'next/link';
import { MASTHEAD_LINKS, MASTHEAD_TITLE, SPEC_VERSION } from '@/app/layout.config';
import { SearchButton } from './search-button';

export function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <Link href="/" className="wordmark">
          {MASTHEAD_TITLE} <em>{SPEC_VERSION}</em>
        </Link>
        <nav>
          {MASTHEAD_LINKS.map((l) =>
            l.external ? (
              <a key={l.url} href={l.url} className="offsite">
                {l.text}
              </a>
            ) : (
              <Link key={l.url} href={l.url}>
                {l.text}
              </Link>
            ),
          )}
          <SearchButton />
        </nav>
      </div>
    </header>
  );
}
