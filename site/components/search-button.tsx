'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';

/** Search lives in the top bar, and is the same dialog Ctrl/Cmd-K opens. */
export function SearchButton() {
  const { setOpenSearch, enabled } = useSearchContext();
  if (!enabled) return null;
  return (
    <button type="button" className="kit-topbar-search" onClick={() => setOpenSearch(true)}>
      Search <kbd>⌘K</kbd>
    </button>
  );
}
