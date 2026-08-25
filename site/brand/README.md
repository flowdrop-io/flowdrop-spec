# brand/ — vendored copy

**Do not edit these files here.** The master is
`apps/flowdrop-website/brand/` in the FlowDrop workspace; this is a copy,
committed because this repo builds its own Docker image and cannot reach
across repo boundaries at build time. A symlink out of the build context
dangles in the builder and fails on first dereference — that exact failure
already cost this project a broken website image once.

`tokens.css` is byte-identical to the master.

## What this site takes, and what it does not

This site is a **sanctioned divergence**. It keeps its own palette
(`--paper`/`--ink`/`--accent`), its own three faces (Spectral + IBM Plex,
self-hosted via `next/font/google`) and its own typographic scale, all
declared in `app/global.css`. The specification is meant to read like a
specification, not like the marketing site.

So only the *values* are imported, and only the shared footer binds to them.
`tokens.css` declares nothing but custom properties, so importing it applies
no styling on its own — an unreferenced token costs nothing. That is what
makes taking the package safe here: the footer is the one surface that has
to match flowdrop.io exactly, and it now reads the same values the master
does instead of carrying copied literals that drift silently.

The fonts are deliberately **not** vendored: this site does not set Suisse
Int'l anywhere, so the four `woff2` files would be dead weight in the image.

To change a brand value, change the master and re-copy.
