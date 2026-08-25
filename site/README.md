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
file `out/api/search`, and the client fetches exactly `/spec/api/search`. A rule
that appends a trailing slash to every path will break search.

## It is published under `/spec`

The site is a subfolder of `https://flowdrop.io`, not a host of its own:
`spec.flowdrop.io` has no DNS record and is not going to get one. `basePath:
'/spec'` in `next.config.mjs` is what makes that work, and it has two consequences
worth knowing before editing anything here.

**The export is still written to `out/` with no `spec/` directory in it.** basePath
is baked into the emitted markup and asset URLs, not into the file layout, so the
Dockerfile copies `out/` to `<nginx root>/spec`. The base path exists in the
filesystem rather than in a rewrite, which is why every `try_files $uri` in
`nginx.conf` still means what it says. An ingress `rewrite-target` would strip the
prefix before nginx saw it, and the client-side router and the extensionless
`/spec/api/search` fetch would then both fail, quietly.

**Next adds the base path to its own links and to nothing else.** `<Link>`, assets,
`router.push` and metadata resolved against `metadataBase` all get it. A plain
`<a href>`, a `fetch()` argument, and anything concatenated onto `SPEC_ORIGIN` do
not. So:

- Hand-written paths go through `withBase()` from `layout.config.tsx`.
- `SPEC_ORIGIN` already ends in `/spec`, and everything appended to it is a
  base-path-less site path (`/rules/x`), so the prefix is contributed exactly once.
  A `/spec/spec/…` would appear only in `rules.json` and the markdown twins, which
  is why CI greps the export for it.

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
  reader from `https://flowdrop.io/spec/rules/x` to `http://flowdrop.io:80/…`.
- `add_header` does not merge across levels in nginx: a location setting any
  `add_header` discards every one from the server block. Each location sets
  `Cache-Control`, so the security headers live in `nginx-headers.conf` and are
  included into each location explicitly.

## Published for machines as well as people

| URL | What |
|---|---|
| `/spec/rules/<family>/<rule>.md` | Any page as markdown, with its identifier, facets and a link home |
| `/spec/conventions.md`, `/spec/glossary.md` | The same, for the two reference pages |
| `/spec/llms.txt` | Index: every rule, one line each, with links |
| `/spec/llms-full.txt` | The whole corpus in one document (~330KB, ~88KB gzipped) |
| `/spec/rules.json` | The corpus as data, including declined identifiers (~470KB, ~97KB gzipped) |
| `/spec/schema/1/rule.json` | The schema a rule file must satisfy, at its own `$id`. `/spec/schema/rule.json` redirects here |
| `/spec/sitemap.xml`, `/spec/robots.txt` | 433 URLs; everything allowed, sitemap declared. `robots.txt` is only honoured at the origin root, so the operative copy is `flowdrop.io/robots.txt` |

Each page's head declares `llms.txt`, `rules.json` and its own markdown twin as
`rel="alternate"`, and the footer links them as anchors, because crawlers follow
anchors reliably and head links inconsistently. **Next replaces `alternates`
wholesale when a page declares its own**, so `MACHINE_ALTERNATES` in
`layout.config.tsx` is spread into every page's metadata — declaring it only in the
root layout silently removes it from every page that sets its own.

They are generated from the same YAML the pages are, in `lib/markdown.ts` — not
scraped back out of the rendered HTML, so the two renderings cannot drift.

**Why the files live under `/llms/` and not beside their pages.** A Next dynamic
route segment cannot carry an extension: `[rule].md` is a literal folder name, not a
parameter, so `/rules/gr-store/store-2.md` cannot be generated directly. The route
emits `/llms/gr-store/store-2.md` and nginx serves it at the conventional URL. The
`.md` URL is the address to cite; `/llms/…` is where the file happens to sit, and is
what the in-page copy button fetches so it also works under `next dev`, where there
is no nginx.

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
