# The FlowDrop Workflow Specification

The rules a FlowDrop workflow obeys (how a workflow is written, stored,
validated, and executed), stated independently of any one implementation.

**Status: draft, not yet published.** The rule corpus — 399 rules — has been
migrated out of [FlowDrop for Drupal][fddo], where it was first written. The site
builds; it is not yet deployed, so nothing here is citable by URL.

## What this is, and what it is not

This specification is a **target**. It states what a conforming implementation
must do. Where an implementation disagrees with a rule, the rule is what is
intended and the implementation has a defect, unless the rule itself is wrong,
which is a reportable bug in this repository.

It is **informative only**. It confers no status, issues no certification, and
grants no mark. It carries **no implementation status**: nothing here records
which implementation meets which rule. Each implementation publishes its own
standing against these rules in its own documentation.

## Layout

| Path | Contents |
|---|---|
| `rules/*.yml` | One file per rule. The normative text and its metadata. |
| `rules/schema.json` | The schema every rule file must satisfy. |
| `rules/REGISTRY.lock` | Every rule identifier ever issued **or blocked**. Append-only. |
| `narrative/*.mdx` | Optional prose for a rule: what it means, examples, why. |
| `conventions.md` | Vocabulary and references shared by every rule. |
| `scripts/` | Validation run in CI. |
| `site/` | The published site. Generates one page per rule from `rules/`; nothing it renders is committed. |

The site reads `rules/`, `narrative/` and `conventions.md` directly and renders
one page per rule. No page source is generated into git. See
[`site/README.md`](site/README.md) to build it.

## Rule identifiers are permanent

`STORE-2` means one thing forever. Identifiers are never renumbered and never
reused, because they are cited from tests, issues and other documents outside
this repository. A withdrawn rule is marked withdrawn; its number is not
recycled. A number in use elsewhere for a rule this specification has declined is
**reserved** and never issued here, so an identifier means the same thing in every
document that cites it. CI enforces all of this.

## Contributing

Corrections are welcome, including "this rule is wrong". Read
[CONTRIBUTING.md](CONTRIBUTING.md) first: a change to what an implementation
must do is handled differently from an editorial fix.

## Licence

Two licences, deliberately:

- **The specification text** (`rules/`, `narrative/`, `conventions.md`, and the
  prose in this README) is licensed **CC BY 4.0** ([LICENSE](LICENSE)). Quote it,
  translate it, build on it; attribute it.
- **The code** (`scripts/` and `site/`) is licensed **MIT**
  ([LICENSE-CODE](LICENSE-CODE)).

[fddo]: https://www.drupal.org/project/flowdrop
