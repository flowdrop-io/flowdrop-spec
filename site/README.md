# The specification site

A static site with one page per rule, generated from `../rules/*.yml`. **Nothing
it renders is committed** — there is no generated MDX in git. The only authored
content here is the site chrome (`content/index.mdx`) and the glossary
(`content/glossary.mdx`); rule text comes from the YAML, and the conventions page
is `../conventions.md` read at build time.

## Build

```bash
npm install
npm run build      # → out/
```

`out/` is a plain directory of files (`output: 'export'`, `trailingSlash: true`),
ready for the nginx static-site chart. There is no server component.

One caveat for the nginx config: the search index is emitted as the extensionless
file `out/api/search`, and the client fetches exactly `/api/search`. A rule that
appends a trailing slash to every path will break search.

## How it fits together

| File | Does |
|---|---|
| `lib/rules.ts` | Reads `../rules/*.yml`, `../rules/REGISTRY.lock` and `../narrative/*.mdx`. Owns slugs, family order, backlinks and the narrative staleness check. |
| `lib/source.ts` | Builds the programmatic `StaticSource` — one `type:'page'` per rule, plus `type:'meta'` files so the sidebar is grouped by family **in registry order**, not alphabetically. |
| `lib/linkify.ts` | The ID matcher, written once. |
| `lib/remark-autolink.ts` | Call site 1 — narrative MDX, via remark. |
| `components/prose.tsx` | Call site 2 — the YAML normative/summary strings, which never pass through remark. |
| `components/rule-page.tsx` | The page anatomy. `sections()` is the single decision about what exists, so the TOC and body cannot disagree, and an absent section is omitted rather than rendered empty. |
| `components/facets.tsx` | The `/rules` filter view (family, profile, level, posture). |
| `app/api/search/route.ts` | Prerendered GET route handler emitting the static search index. |

Only identifiers that resolve to a real rule page become links. A ruling
(`OPEN-19`, `DF-7`) has no page, so both call sites render it as a marker.

## What this site must never carry

No implementation status of any kind: no conformance claims, no matrix, no gap
view, no per-implementation notes, no badge, mark or seal. The site is
informative and confers nothing.
