# Deferred rules

These 22 of the registry's 421 rules are **not** in the specification. Each was
either bound to one implementation's framework surface, a record of how one product
moved its own data across a version boundary, or a sentence that would generalise
into something nothing could break.

**Nothing is lost.** Every rule here keeps living in FlowDrop for Drupal's registry
with its tests and its `Covers spec-registry:` bindings, in the local rule namespace
the extraction plan describes.

**Their identifiers are reserved, not free.** Each is recorded in `REGISTRY.lock`
with a `reserved` marker, and CI checks that no rule file claims one. The
specification will never issue these numbers for anything else: they are cited today
from tests, issues and an implementation's own documentation, and an identifier that
meant one thing in that registry and another here would make both documents
unreadable. If one of these rules turns out to belong in the specification after all,
it is written as a **new** rule with a **new** number, and its origin is recorded.

## What changed on 2026-08-25

The first pass deferred 34 rules. A ruling session took them one at a time and
issued 12 of them, amended 2 further rules to absorb a deferred clause, and closed
the remaining 24 entries permanently.

**Issued:** `STORE-6` (what storing discards, keeps and leaves alone),
`STORE-8` (the contract version's format), `STORE-15` (search),
`R6.a` (config is a JSON object), `LANG-20` (testing whether a path exists),
`SCH-24` (a node type that fails to build), `SCH-45` (checking a stored overlay),
`MEM-9` and `MEM-15` (the session access model), `EXPO-16` (seeding exposure),
`RT-TOOL-5` (artifact collection), `OCX-5` (the condition vocabulary).

**Amended to absorb a deferred clause:** `BR-2` (a source declaring no branches
gates nothing — the payload fallback the registry records as wrong in both
directions is excluded, and must not be reinstated as a fix) and `INT-9` (snapshot
access is enforced once, at the API boundary; cleanup runs with no principal).

**Two family-wide statements** went to `conventions.md` rather than becoming rules:
a validation result's errors carry no defined order, and rules about authoring
surfaces constrain the data such a surface may produce, never how it presents
controls.

The governing question was not "is this portable?" but **"does this deferral hide a
question two implementations could answer differently?"** Where it did, the
specification decides the answer and states the reason — silence is right only where
nothing observable turns on it. Where a rule records behaviour as *known wrong*
rather than merely undermotivated, it stays out: `BR-2`'s fallback is the example,
and it is the reason that guard exists.

## By family

| Family | In the spec | Deferred |
|---|---:|---:|
| GR-STORE | 15 | 0 |
| GR-API | 8 | 0 |
| GR-VAL | 40 | 1 |
| GR-EDGE | 9 | 0 |
| GR-SCHEMA | 47 | 0 |
| GR-CFG | 18 | 0 |
| GR-EXPO | 16 | 3 |
| GR-DYN | 7 | 0 |
| GR-MEM | 16 | 0 |
| GR-MAN | 20 | 1 |
| GR-LANG | 28 | 1 |
| RT-CMP | 11 | 0 |
| RT-ERR | 13 | 0 |
| RT-ORC | 16 | 1 |
| RT-BR | 7 | 0 |
| RT-DATA | 12 | 0 |
| RT-INT | 20 | 1 |
| RT-GATE | 14 | 1 |
| RT-TOOL | 10 | 0 |
| RT-SG | 20 | 0 |
| RT-PIPE | 9 | 0 |
| RT-PLAY | 5 | 0 |
| RT-SNAP | 2 | 0 |
| RT-META | 8 | 1 |
| RT-OCX | 9 | 0 |
| RT-NET | 3 | 0 |
| RT-MD | 2 | 0 |
| RT-CRON | 2 | 0 |
| RT-TRIG | 3 | 0 |
| RT-ST | 9 | 1 |
| RT-MIG | 0 | 7 |
| RT-UPD | 0 | 4 |
| **total** | **399** | **22** |

Two entries below describe a clause of a rule that is otherwise in the
specification (`INT-13`) or a section preamble rather than a numbered rule, which is
why 24 entries account for 22 reserved identifiers.

# GR-EXPO: deferred rules

## EXPO-9: one-time exposure freeze updates
**Bucket:** drupal-bound
**Who depends on it:** nobody outside the implementation; it is a migration of one
product's already-installed sites.
**Why deferred:** The row describes update hooks that write exposure values onto
existing stored node types once, and repair an earlier sweep. A spec target says
what exposure means, not how one implementation backfilled it for data written
before the rule existed.

## EXPO-18: new-port exposure drift between fresh and existing installs
**Bucket:** drupal-bound
**Who depends on it:** nobody outside the implementation's packaging.
**Why deferred:** The whole rule is config-install packaging mechanics: shipped
install configuration reaches new sites only, so an existing site has no entry for
a newly added port and a post-update hook backfills it. That is a property of how
one implementation distributes configuration, not of the workflow language.

## EXPO-19: legalizing loopback edges stored before the reserved port existed
**Bucket:** drupal-bound
**Who depends on it:** nobody outside the implementation; it repairs one product's
stored workflows.
**Why deferred:** A post-update hook walks stored workflows and writes instance
exposure overrides so edges saved before the reserved `loop_back` input was
injected keep validating. It is a data migration for a specific version boundary,
and generalising it would bind every implementation to a history it never had.

# GR-LANG: deferred rules

## LANG-5: `validate()` has exactly one production call site
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody outside the implementation; it is a drift guard on
one codebase's internal call graph.
**Why deferred:** The row promises that expression validation is called from the
save-time validator and from nowhere else, and that the syntax-hint surface is
called from nowhere at all. That is a statement about where one implementation's
code lives, not about behaviour any caller can observe; the observable half (an
expression's syntax is checked when the workflow is saved) belongs to the
validator family, not here.

# GR-MAN: deferred rules

## MAN-4: R4 guards manifest integrity
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody directly; the row is a pointer to GR-VAL R4.a–e,
which carries the actual promises and the tests.
**Why deferred:** The row states no promise of its own; written as a normative
sentence it would say only that some other rule applies, which no implementation
could be shown to break. The integrity guarantees belong in R4.a–e.

# GR-VAL: deferred rules

## VAL-PERF: the validator constructs executors only for the exposure checks
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody outside the implementation. It bounds how many
executor objects one implementation builds during a validation pass.
**Why deferred:** the claim is about object construction inside a single
implementation, and the registry itself narrows it twice (it is not a claim about
total construction, and the checks that do construct are named by internal
collaborator). Generalised to "an implementation should not construct executors
unnecessarily" it could not be shown to be broken by anything.

## Section preamble: inter-rule ordering
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody. Ruled 2026-08-25: a consumer could come to depend on
the order errors arrive in, so `conventions.md` now states outright that a
validation result's errors carry no defined order. That closes the observable half;
the evaluation ordering itself stays out.
**Why deferred:** the family preamble states a whole-family evaluation order
(structure → node type → plugin → config → expressions → edge endpoints → edge
exposure → exposure map → terminal reachability). Nothing in the registry says a
result's errors are ordered, or that an earlier rule suppresses a later one, and
where a rule really does suppress another the row says so itself and that
suppression has been written into the rule. As a free-standing sentence the
ordering has no observable consequence, so it was not promoted to a rule.
Locator grammar and severity, the preamble's other two claims, *are* observable
and have been written onto each rule that depends on them instead.

# RT-GATE: deferred rules

## RT-GATE-10: upgrade fidelity from earlier releases
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody outside the implementation that has the earlier
releases to upgrade from.
**Why deferred:** Everything binding in this row is a statement about two specific
one-shot upgrade passes, a legacy tri-state key, and an import path that folds it
forward, none of which a second implementation has. Stripped of those specifics
the rule degrades to "migrations converge on the same state whichever order they
run in", which constrains nothing and cannot be shown to be broken.

# RT-INT: deferred rules

## INT-21: the callback route's authentication provider is an operator prerequisite
**Bucket:** drupal-bound
**Who depends on it:** an operator provisioning a service account on a site where
the authentication provider ships as a separately installable module.
**Why deferred:** The rule exists only because the callback route's sole
authentication provider is an optional module the runtime deliberately does not
depend on, so the whole promise is a warning raised on a host's status report,
gated on a permission grant, in the host's runtime requirements phase. An
implementation that simply has the authentication scheme has nothing to warn
about, so generalising this promotes a packaging accident into a rule.

## INT-13 (in part): the dual read for checkpoint payloads written before the status field
**Bucket:** accident-not-promise
**Who depends on it:** only data already on disk in the implementation that
introduced the field.
**Why deferred:** INT-13's substance (the terminal outcome is persisted, never
re-derived) is extracted. The clause requiring a payload with no status key to
keep the older derivation byte-for-byte binds an implementation to reproduce a
derivation that was explicitly unable to express cancellation, purely to read its
own historical rows. A new implementation has no such rows.

# RT-META: deferred rules

## META-2: cacheability declarations as access control
**Bucket:** drupal-bound
**Who depends on it:** the host framework's cache layers and any purge integration keying on its tag strings; no second implementation can honour it as written.
**Why deferred:** The rule is stated entirely in Drupal cache metadata (`no_cache`, internal versus dynamic page cache, `user.permissions` and `languages:language_interface` contexts, and a `config:…` tag pinned verbatim because a purge integration keys on the literal string). The portable half (a response varying by principal must not be served to another principal) is already carried by PIPE-6, so extracting a Drupal-shaped restatement would add a promise no other implementation could meet.

# RT-MIG: deferred rules

The whole family is deferred. These rules describe the deploy-time migration
primitives one implementation offers to authors of its own upgrade hooks.

**Flagged 2026-08-25 as the one deferral with a plausible future.** If portable
workflow-surgery tooling is ever wanted, it is designed forward as an optional
profile, on its own merits — never extracted from these method signatures. Because
`MIG-1`–`MIG-7` are reserved, such a profile starts at `MIG-8`. They are
not a surface a workflow author, an editor client or an API caller can observe,
and no second implementation has to offer the primitives at all. The rules keep
living in the implementation's registry with their tests.

## MIG-1: post-mutation validation before save
**Bucket:** drupal-bound
**Who depends on it:** authors of that implementation's deploy-time upgrade hooks.
**Why deferred:** It is a contract of one internal mutation service, not of the
stored workflow. The general invariant it rests on (a refused write persists
nothing) is already the storage families' business.

## MIG-2: a refused migration leaves the stored workflow byte-identical
**Bucket:** drupal-bound
**Who depends on it:** the same hook authors.
**Why deferred:** Same surface as MIG-1. Byte-identity of a snapshot-and-restore
around an in-process service call is a property of that service, and nothing
outside it can observe the difference.

## MIG-3: every primitive is idempotent
**Bucket:** drupal-bound
**Who depends on it:** the same hook authors.
**Why deferred:** Idempotence of named primitives (`replaceNodeType`,
`insertNodeBetween`, `renamePort`, `rewireEdge`, `removeNodeReconnect`) presumes
that set of primitives exists. Specifying it would bind a second implementation to
an API shape it has no reason to have.

## MIG-4: replaceNodeType refuses an unmapped port
**Bucket:** drupal-bound
**Who depends on it:** the same hook authors.
**Why deferred:** The rule is the signature and refusal behaviour of one named
method. There is no portable promise left once the method name is dropped.

## MIG-5: insertNodeBetween refuses a missing or conflicting node id
**Bucket:** drupal-bound
**Who depends on it:** the same hook authors.
**Why deferred:** As MIG-4: one named method's argument validation.

## MIG-6: a migration batch is all-or-nothing
**Bucket:** drupal-bound
**Who depends on it:** the same hook authors.
**Why deferred:** It governs a batching callable that only exists inside this
service. A second implementation with no batch primitive cannot break or keep it.

## MIG-7: migrations operate on the raw stored shape
**Bucket:** drupal-bound
**Who depends on it:** the same hook authors.
**Why deferred:** The rule is defined entirely by what it refuses to route
through: one implementation's DTO read path, with its config-default merge,
dangling-edge pruning and edge-id minting. None of those are spec concepts, so
the rule cannot be stated without them.

# RT-ORC: deferred rules

## ORC-6: shared orchestrator hierarchy
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody outside the implementation; no caller can observe where a strategy inherits its behaviour from.
**Why deferred:** The rule's content is that the shared behaviours live in common base classes and are inherited rather than reimplemented, which is a statement about code structure, not about what a run does. Each behaviour it enumerates (error-edge payload shape, retry, stop handling, interrupt handling, budget) is already promised by a rule of its own, so generalising ORC-6 would say only "the strategies agree", which no implementation could be shown to break.

# RT-ST: deferred rules

## ST-10: no per-execution ownership check on the status surface
**Bucket:** accident-not-promise
**Who depends on it:** nobody; the surface it guarded was removed.
**Why deferred:** The row states that the status endpoints were permission-gated
with deliberately no per-execution ownership check. The registry itself records
that this was safe only because the tracker was request-scoped and in memory, so
generalising it would bind every future implementation to omit an authorisation
check it actually needs.

# RT-UPD: deferred rules

The whole family is deferred. These rules govern deploy-time update hooks: how
one implementation's own historical schema migrations behave when its host's
update runner invokes them. The host's runner, its sandbox contract and the legacy
columns being backfilled are all specific to that implementation and to one
upgrade path through it. Nothing a caller can observe depends on any of it.

## UPD-1: a sandboxed hook's progress counter counts ids consumed
**Bucket:** drupal-bound
**Who depends on it:** the implementation's own upgrade path.
**Why deferred:** The rule is stated in terms of the host update runner's sandbox
protocol, a `#finished` fraction the runner re-invokes on until it reaches 1. A
runtime with no such runner has nothing to conform to.

## UPD-2: a backfill writes only where the destination is empty
**Bucket:** drupal-bound
**Who depends on it:** the implementation's own upgrade path.
**Why deferred:** It is idempotence for a one-time promotion of named legacy
columns into named typed ones. Both the columns and the reason re-runs happen
(UPD-1's sandbox protocol) are outside the spec.

## UPD-3: the destructive passes delete on a stated predicate and nothing wider
**Bucket:** drupal-bound
**Who depends on it:** the implementation's own upgrade path.
**Why deferred:** The predicates name that implementation's message roles,
metadata keys and pipeline lifecycle writers. The care is real and the rule
belongs where it is; there is no portable sentence underneath it.

## UPD-4: the session lift's JSON-substring probe
**Bucket:** drupal-bound
**Who depends on it:** the implementation's own upgrade path.
**Why deferred:** A `LIKE` probe into a schemaless serialised blob column is a
storage-engine workaround, not a promise, precisely the kind of framework
limitation the extraction is told never to promote. The registry already flags it
as depending on a spelling nothing pins.
