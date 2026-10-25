import type { ReactNode } from 'react';

/**
 * The shared top bar of flowdrop.io/docs and flowdrop.io/spec (D-03).
 *
 * Plain React with no framework import, so both sites render it from their own
 * layout. Everything site-specific arrives as a prop: the wordmark (an element,
 * so a site can wrap it in its own router link), the search trigger and the
 * theme toggle. Styles are in css/chrome.css, scoped to `.kit-topbar`.
 *
 * The site links are absolute because the two sites and the marketing site are
 * three separate builds on one origin.
 */

export type TopBarLink = { text: string; href: string };

export const SITE_LINKS: (TopBarLink & { id: 'docs' | 'spec' | 'home' })[] = [
  { id: 'docs', text: 'Docs', href: 'https://flowdrop.io/docs/' },
  { id: 'spec', text: 'Spec', href: 'https://flowdrop.io/spec/' },
  { id: 'home', text: 'FlowDrop', href: 'https://flowdrop.io' },
];

export type TopBarProps = {
  /** The wordmark element, e.g. `<a className="kit-wordmark" href="/">FlowDrop <em>Docs</em></a>`. */
  wordmark: ReactNode;
  /** Which site this is, so its own link carries `aria-current`. */
  current?: 'docs' | 'spec';
  /** Replaces the default Docs / Spec / FlowDrop links. */
  links?: TopBarLink[];
  /** The site's search trigger. Give a button `className="kit-topbar-search"`. */
  search?: ReactNode;
  /** The site's theme toggle. */
  themeToggle?: ReactNode;
  /** Id of the main landmark; adds a skip link when given. */
  skipTo?: string;
  className?: string;
};

export function TopBar({
  wordmark,
  current,
  links,
  search,
  themeToggle,
  skipTo,
  className,
}: TopBarProps) {
  const items = links
    ? links.map((l) => ({ ...l, id: undefined as string | undefined }))
    : SITE_LINKS;
  return (
    <header className={className ? `kit-topbar ${className}` : 'kit-topbar'}>
      {skipTo ? (
        <a className="kit-skip" href={`#${skipTo}`}>
          Skip to content
        </a>
      ) : null}
      <div className="kit-topbar-inner">
        <div className="kit-topbar-brand">{wordmark}</div>
        <nav className="kit-topbar-nav" aria-label="FlowDrop sites">
          {items.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={l.id && l.id === current ? 'page' : undefined}
            >
              {l.text}
            </a>
          ))}
        </nav>
        {search ? <div className="kit-topbar-slot">{search}</div> : null}
        {themeToggle ? <div className="kit-topbar-slot">{themeToggle}</div> : null}
      </div>
    </header>
  );
}
