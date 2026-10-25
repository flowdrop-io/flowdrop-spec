# brand/ — vendored copy

**Do not edit these files here.** The master is
`apps/flowdrop-website/brand/` in the FlowDrop workspace; this is a copy,
committed because this repo builds its own Docker image and cannot reach
across repo boundaries at build time. A symlink out of the build context
dangles in the builder and fails on first dereference — that exact failure
already cost this project a broken website image once.

`tokens.css` is byte-identical to the master.

## What this site takes, and what it does not

This site wears the **Factorial look** (the `factorial-design` skill: `modules/web.md` for
the chrome, `modules/report.md` for the reading column): Suisse Int'l for text and headings at 400/600, blue-dark
ink on a white page, grey-100 as the only surface, hairline rules, and orange
kept to the kicker, the normative edge, warnings and the focus ring. The palette in `app/global.css`
maps onto `factorial-tokens.css`, a copy of the factorial-design token subset
the site sets (and the place its light/dark switch lives); the shared footer
binds to `tokens.css` as before.

`fonts/` holds the two Suisse Int'l faces the site sets (Regular, SemiBold),
copied from the master's `brand/fonts/` and loaded by `next/font/local` in
`app/layout.tsx`. The master's `fonts.css` is not used: its root-absolute
`/fonts/` URLs would miss the `/spec` basePath. Code stays in IBM Plex Mono:
the Suisse Int'l Mono web subset has no `<  >  \  ^  ~`.

To change a brand value, change the master and re-copy.
