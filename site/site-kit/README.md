# site-kit — the shared look of flowdrop.io/docs and flowdrop.io/spec

**If you are reading this inside `site/site-kit/` of a site repo, it is a copy.
Do not edit it.** CI fails on any hand edit (`check-lock.sh`). The master is
`process/site-kit/` in the FlowDrop workspace; change it there and run
`scripts/site-kit sync`.

## Why copies

Both sites build their own Docker image and cannot read files from another repo
at build time; a symlink out of the build context once broke the website image.
So the kit is copied into each repo and committed. `kit.lock` records a SHA-256
per copied file, which lets each site's CI catch a hand edit without access to
this (private) workspace. Decided in the Docs and Spec Look study (D-06, E-01):
https://claude.ai/artifact/Aro97L5Qd37cDEiX5NHEwn

## What is in it

| Path | Master | Notes |
|---|---|---|
| `brand/tokens.css` | `apps/flowdrop-website/brand/tokens.css` | FlowDrop brand values; the shared footer binds to them. Byte-identical to the master, `site-kit check` verifies it. |
| `brand/factorial-tokens.css` | `factorial-design` skill, `styles/tokens.css` | The Factorial token subset with the light/dark switch. Re-copy from the skill, never edit values here. |
| `css/index.css` | here | Imports all the CSS files below, in order. |
| `css/palette.css` | here | fumadocs' `--color-fd-*` tokens mapped onto `--fac-*` for both themes, html/body background, the 3px orange focus ring. Only for sites on fumadocs; the other two are plain CSS. |
| `css/report.css` | here | The reading column, scoped to `.kit-prose` (put it on the article body): type scale 36/26/19/16/14, links, plus-bullet lists, tables, callouts (fumadocs through `[style*='--callout-color']`, other markup through `.kit-callout`, `.kit-callout-title`, `.kit-callout--warning`), `.kit-note`, plus `.kit-title` and `.kit-lead` for a page title and lead that sit outside the prose. |
| `css/chrome.css` | here | Top bar (`.kit-topbar`, `.kit-wordmark`, `.kit-topbar-search`) and footer (`.fdftr-*`) styles. Plain CSS, no fumadocs selectors, so /spec can import it alone. |
| `css/docs-nav.css` | here | fumadocs sidebar, TOC and breadcrumb on the light app-nav rules (D-02): group labels, items, active item = 3px orange bar + 600, text colour. Selects by `#nd-sidebar`, `#nd-toc`, `#nd-page` and data attributes. Fumadocs only. |
| `components/top-bar.tsx` | here | `TopBar`: wordmark, Docs / Spec / FlowDrop links, `search` and `themeToggle` slots. Plain React, no framework import. |
| `components/footer.tsx` | here | `Footer`: the shared block, one link set; `children` is the slot for a site's own strip, `basePath` prefixes the logo, `githubUrl` the GitHub icon. |
| `css/code.css` | here | Code blocks and inline code; defines the `--shiki-*` variables the syntax theme emits, from tokens only. |
| `shiki/css-variables.mjs` | here | Exports `kitShikiTheme`, a Shiki CSS-variables theme. fumadocs-mdx: `rehypeCodeOptions: { themes: { light: kitShikiTheme, dark: kitShikiTheme } }`. Needs `shiki` as a direct dependency of the site. |
| `check-lock.sh` | here | The CI check each site runs. |

Not in it yet, by decision: the Suisse Int'l fonts. They stay in each site's
`brand/fonts/` until Factorial confirms the licence for flowdrop.io (C-01); the
kit adds no further public copies until then.

The plan is https://claude.ai/artifact/Ukgr9SHCCXo8pMjd7DzSYH. M1 (report layer) and
M2 (top bar, footer, docs nav) are in.

Using the CSS: import `css/index.css` after the framework's own presets, so the
kit's tokens win. Fences with a head row need `title="..."` on the fence;
Mintlify-style `js file.js` meta is not a title to fumadocs.

## Using the components

Both sites have `paths: { "@/*": ["./*"] }` and include `**/*.tsx`, and the kit
is copied to `site/site-kit/`, so import with `@/site-kit/components/top-bar`
and `@/site-kit/components/footer`. The components import only `react` types,
so they compile under each site's strict config. Import `css/index.css` (docs)
or `css/chrome.css` alone (spec) from `global.css`.

```tsx
<TopBar current="docs" skipTo="main"
  wordmark={<a className="kit-wordmark" href="/docs/">FlowDrop <em>Docs</em></a>}
  search={<FullSearchTrigger />} themeToggle={<ThemeSwitch />} />
<Footer basePath="/docs" githubUrl="https://github.com/flowdrop-io/flowdrop">{ownStrip}</Footer>
```

Light-mode syntax colours: strings, numbers and variables take the tokens that
reach AA on the grey code surface (code.css explains the measurements).

## Commands (from the workspace root)

```bash
scripts/site-kit sync            # copy into apps/flowdrop-io.docs and apps/flowdrop-spec, write kit.lock
scripts/site-kit sync <dir>...   # same, into other checkouts or worktrees of those repos
scripts/site-kit check           # master vs. copies vs. website master; non-zero on drift
```

`sync` writes into whatever branch each checkout has checked out. Commit the
result there, in each site repo, as its own commit.
