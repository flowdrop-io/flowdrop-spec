'use client';

import { useDocsSearch } from 'fumadocs-core/search/client';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import { withBase } from '@/app/layout.config';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';

/**
 * Static search. The index is a prerendered GET route handler (app/api/search),
 * which `output: 'export'` supports because it never reads the Request.
 *
 * `from` is given explicitly. The client's own default is `/api/search`, and the
 * base path it would otherwise join on is Vite's, which under Next is always `/` —
 * so on a sub-path deployment the default fetches a URL that does not exist, and
 * the only symptom is a search dialog that returns nothing.
 *
 * The dialog is fumadocs' own, so `.spec-dialog` is where global.css takes its
 * card cornering and drop shadow back off it. Its parts carry only tailwind
 * utilities, so the rules there hang off the stable bits: `button[aria-selected]`
 * for a result row, `[aria-label='Close Search']` for the ESC key.
 */
export default function SpecSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({ client: staticClient({ from: withBase('/api/search') }) });

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent className="spec-dialog">
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
