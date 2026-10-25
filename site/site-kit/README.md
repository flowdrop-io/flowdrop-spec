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
| `check-lock.sh` | here | The CI check each site runs. |

Not in it yet, by decision: the Suisse Int'l fonts. They stay in each site's
`brand/fonts/` until Factorial confirms the licence for flowdrop.io (C-01); the
kit adds no further public copies until then.

Coming with the plan (https://claude.ai/artifact/Ukgr9SHCCXo8pMjd7DzSYH): the
report CSS layer (M1), the shared top bar and footer (M2).

## Commands (from the workspace root)

```bash
scripts/site-kit sync            # copy into apps/flowdrop-io.docs and apps/flowdrop-spec, write kit.lock
scripts/site-kit sync <dir>...   # same, into other checkouts or worktrees of those repos
scripts/site-kit check           # master vs. copies vs. website master; non-zero on drift
```

`sync` writes into whatever branch each checkout has checked out. Commit the
result there, in each site repo, as its own commit.
