'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';

/** Search lives in the masthead, and is the same dialog Ctrl/Cmd-K opens. */
export function SearchButton() {
  const { setOpenSearch, enabled } = useSearchContext();
  if (!enabled) return null;
  return (
    <button type="button" className="mast-search" onClick={() => setOpenSearch(true)}>
      Search <kbd>⌘K</kbd>
    </button>
  );
}
