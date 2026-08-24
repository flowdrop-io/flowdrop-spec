# The specification site

A static site with one page per rule, generated from `../rules/*.yml`. **Nothing
it renders is committed**: there is no generated MDX in git. The only authored
content here is the site chrome (`content/index.mdx`) and the glossary
(`content/glossary.mdx`); rule text comes from the YAML, and the conventions page
is `../conventions.md` read at build time.

## Run it locally

```bash
npm install
npm run dev        # → http://localhost:3000
```

Hot-reloads on a change to any rule YAML, to `../conventions.md`, or to a
narrative file.

## Build

```bash
npm run build      # → out/
npm start          # serve out/ as it will actually be deployed
```

`out/` is a plain directory of files (`output: 'export'`, `trailingSlash: true`),
ready for the nginx static-site chart. There is no server component.

One caveat for the nginx config: the search index is emitted as the extensionless
file `out/api/search`, and the client fetches exactly `/api/search`. A rule that
appends a trailing slash to every path will break search.

## How it is deployed

`Dockerfile` at the repository root builds this site into an nginx image
(`ghcr.io/flowdrop-io/flowdrop-spec`) and `.github/workflows/deploy.yml` pushes it on
every commit to `main`, then triggers the GitLab pipeline that runs the
`static-sites` Helm chart. **The build context is the repository root, not `site/`** —
the site reads `../rules` while it builds.

Two things the nginx config exists to get right, both verified against a running
container rather than assumed:

- `trailingSlash: true` means every page is a directory, so nginx redirects the
  slash-less form. The redirect is **relative** (`absolute_redirect off`), because
  nginx sees plain HTTP on port 80 behind the ingress and would otherwise send a
  reader from `https://spec.flowdrop.io/rules/x` to `http://spec.flowdrop.io:80/…`.
- `add_header` does not merge across levels in nginx: a location setting any
  `add_header` discards every one from the server block. Each location sets
  `Cache-Control`, so the security headers live in `nginx-headers.conf` and are
  included into each location explicitly.

## How it fits together

| File | Does |
|---|---|
| `lib/rules.ts` | Reads `../rules/*.yml`, `../rules/REGISTRY.lock` and `../narrative/*.mdx`. Owns slugs, family order, backlinks and the narrative staleness check. |
| `lib/source.ts` | Builds the programmatic `StaticSource`: one `type:'page'` per rule, plus `type:'meta'` files so the sidebar is grouped by family **in registry order**, not alphabetically. |
| `lib/linkify.ts` | The ID matcher, written once. |
| `lib/remark-autolink.ts` | Call site 1: narrative MDX, via remark. |
| `components/prose.tsx` | Call site 2: the YAML normative/summary strings, which never pass through remark. |
| `components/rule-page.tsx` | The page anatomy. `sections()` is the single decision about what exists, so the TOC and body cannot disagree, and an absent section is omitted rather than rendered empty. |
| `components/facets.tsx` | The `/rules` filter view (family, profile, level, posture). |
| `app/api/search/route.ts` | Prerendered GET route handler emitting the static search index. |

Only identifiers that resolve to a real rule page become links. A ruling
(`OPEN-19`, `DF-7`) has no page, so both call sites render it as a marker.

## What this site must never carry

No implementation status of any kind: no conformance claims, no matrix, no gap
view, no per-implementation notes, no badge, mark or seal. The site is
informative and confers nothing.
