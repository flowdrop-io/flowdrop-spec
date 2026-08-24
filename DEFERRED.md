# Deferred rules

These 34 of the registry's 421 rules were **not** extracted into the
specification during the P0 pass. Each needs a judgment call that the plan
deliberately reserves for a human: it leans on language semantics in a way that
changes what the rule promises, it is bound to one implementation's framework
surface, it exists only because of a framework limitation (an accident, not a
promise), or it would generalise into a sentence nothing could break.

**Nothing is lost.** Every rule here keeps living in fddo's registry with its
tests and its `Covers spec-registry:` bindings, in the local rule namespace the
plan describes. Their identifiers are **not** recorded in `REGISTRY.lock`, because the
spec has not issued them, so they stay available to the spec should a later
editorial pass rule that one belongs here after all.

## By family

| Family | Extracted | Deferred |
|---|---:|---:|
| GR-STORE | 12 | 3 |
| GR-API | 8 | 0 |
| GR-VAL | 39 | 2 |
| GR-EDGE | 9 | 0 |
| GR-SCHEMA | 45 | 2 |
| GR-CFG | 18 | 0 |
| GR-EXPO | 15 | 4 |
| GR-DYN | 7 | 0 |
| GR-MEM | 14 | 2 |
| GR-MAN | 20 | 1 |
| GR-LANG | 27 | 2 |
| RT-CMP | 11 | 0 |
| RT-ERR | 13 | 0 |
| RT-ORC | 16 | 1 |
| RT-BR | 7 | 0 |
| RT-DATA | 12 | 0 |
| RT-INT | 20 | 1 |
| RT-GATE | 14 | 1 |
| RT-TOOL | 9 | 1 |
| RT-SG | 20 | 0 |
| RT-PIPE | 9 | 0 |
| RT-PLAY | 5 | 0 |
| RT-SNAP | 2 | 0 |
| RT-META | 8 | 1 |
| RT-OCX | 8 | 1 |
| RT-NET | 3 | 0 |
| RT-MD | 2 | 0 |
| RT-CRON | 2 | 0 |
| RT-TRIG | 3 | 0 |
| RT-ST | 9 | 1 |
| RT-MIG | 0 | 7 |
| RT-UPD | 0 | 4 |
| **total** | **387** | **34** |


# GR-EXPO: deferred rules

## EXPO-9: one-time exposure freeze updates
**Bucket:** drupal-bound
**Who depends on it:** nobody outside the implementation; it is a migration of one
product's already-installed sites.
**Why deferred:** The row describes update hooks that write exposure values onto
existing stored node types once, and repair an earlier sweep. A spec target says
what exposure means, not how one implementation backfilled it for data written
before the rule existed.

## EXPO-16: seeding the default-exposure control in the node-type form
**Bucket:** drupal-bound
**Who depends on it:** an authoring interface, but only through this
implementation's form API.
**Why deferred:** The promise is carried by framework form mechanics (the control
is state-gated on a sibling control, and a disabled control is not submitted), so
the rule as stated binds an implementation to that machinery rather than to an
observable outcome. The portable half (a suggestion is consulted only while the
port exists) is already covered by EXPO-6; the rest needs a ruling on what, if
anything, the spec says about authoring surfaces.

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

## LANG-20: `exists('')` is true, and a property path over a scalar is false
**Bucket:** accident-not-promise
**Who depends on it:** unknown; needs a ruling.
**Why deferred:** Both halves read as fall-through rather than design: an empty
path reports existence because it degenerates to the whole context, and a property
path over a scalar reports absence through the same unreadable-path conflation
LANG-8 already covers. Binding a future implementation to either would promote an
edge of one internal query API to a contract.

# GR-MAN: deferred rules

## MAN-4: R4 guards manifest integrity
**Bucket:** vacuous-if-generalised
**Who depends on it:** nobody directly; the row is a pointer to GR-VAL R4.a–e,
which carries the actual promises and the tests.
**Why deferred:** The row states no promise of its own; written as a normative
sentence it would say only that some other rule applies, which no implementation
could be shown to break. The integrity guarantees belong in R4.a–e.

# GR-MEM: deferred rules

## MEM-9: driving a session is a write, not a read
**Bucket:** drupal-bound
**Who depends on it:** unknown; needs a ruling. An API caller depends on "an
observer holding read-only access cannot drive someone else's session", but every
mechanism the row states is Drupal's.
**Why deferred:** The row is a route-requirement, entity-access-operation,
permission-name and field-access statement: `_entity_access: …update`, an
ownership check inside an access control handler, an owner-field clamp to an
edit-any tier. Its portable kernel (driving is a write; ownership requires a real
identity) is already carried by MEM-6 and MEM-8, so extracting it would mean
inventing a permission model the registry does not state in portable terms.

## MEM-15: the access ladder, three handlers, one order
**Bucket:** drupal-bound
**Who depends on it:** unknown; needs a ruling.
**Why deferred:** Four rungs of Drupal permission names, `forbidden()` versus
`neutral()` as distinct verdicts so a later hook cannot grant what was refused,
and per-permission/per-user cacheability metadata. Every load-bearing term is a
Drupal access-API term, and the neutral/forbidden distinction has no meaning
outside a system with hook-based access grants.

# GR-SCHEMA: deferred rules

## SCH-24: what a failing node-type build catches, and what it does not
**Bucket:** php-semantics
**Who depends on it:** nobody outside the implementation; a caller sees the
outcome (the node is returned unenriched), which SCH-25 already promises.
**Why deferred:** The rule's substance is the boundary between two levels of the
PHP throwable hierarchy (an `\Exception` is caught and swallowed, anything else
fails the request), plus an exact log message on a named channel at a named
severity. Neither survives translation to an implementation with a different error
model, and generalising it to "a broken node type must not fail the request" would
promise something the rule deliberately does not.

## SCH-45: the site lane overlay is typed config
**Bucket:** drupal-bound
**Who depends on it:** a site builder hand-writing the overlay, and only through
the host framework's own config validation and translation machinery.
**Why deferred:** The whole rule is about the overlay being declared to the host's
configuration system: a `config_object` with a schema, the strict config schema
checker covering it, the per-test exclusions it lets you delete, and one nested
JSON Schema marked as not-our-keyspace. The portable half ("a malformed overlay is
refused at save, not at render") is worth a ruling but is not what this row says.

# GR-STORE: deferred rules

## STORE-6: two-pass slimming on save
**Bucket:** drupal-bound
**Who depends on it:** partly the API surface: a client that reads back a workflow it
just wrote sees the slimmed nodes, and STORE-14's read-side enrichment is what puts the
dropped metadata back. The rest depends on nothing outside the implementation.
**Why deferred:** The cut runs through the rule, not around it. The portable half is
observable: storing a workflow discards transient canvas state (`selected`, `dragging`,
`deletable`, `nodeId` at both the node and `data` level) and reduces a node's
`data.metadata` to its type anchor, while `measured`, `position`, `data.config`,
`data.label` and `data.extensions` are kept; a node whose type anchor does not resolve
keeps its metadata and its `type` verbatim, since nothing could re-enrich them on read;
and slimming is idempotent. The half that cannot travel is the whole of the rest:
the `isSyncing()` gate, config sync skipping both the slimming and the `created`/
`changed` re-stamp so an imported fat node round-trips verbatim, and the ordering
constraint that slimming run before the parent save hook because dependency calculation
must see the renamed anchor. Under this pass's instruction the whole rule defers;
the first half above is ready for the editorial pass to lift as-is.

## STORE-8: `schema_version` must be semver
**Bucket:** php-semantics
**Who depends on it:** unknown; needs a ruling.
**Why deferred:** What the registry states is not "a version must be semver" but when
that check bites and what escapes it: the constraint applies only under config
validation and not under plain schema conformance, and the empty string is exempt
because that is what the framework's regex constraint does, with a `'0.0.0'` property
default the only thing keeping an unset version semver. Whether the empty string
conforms is precisely the question a portable rule would have to answer, and answering
it here would be a guess rather than an extraction.

## STORE-15: workflow search
**Bucket:** accident-not-promise
**Who depends on it:** clients that pass `?search=`, but only on "a substring match,
case-insensitive, anywhere in the name", not on the shape the registry actually
describes.
**Why deferred:** Every characteristic the row pins is a consequence of the storage
layer having no `LIKE` operator: the literal, unescaped term, `%` and `_` not being
wildcards, and the lowercase-both-sides comparison are what remains when SQL pattern
matching is unavailable, not a decision anyone made. Binding a future implementation to
"wildcards must not work" would promote that accident to a promise; the row's two
transitional input edges (`'0'` treated as no search, an array-valued term answering
500) and its unpinned `changed DESC` ordering need a ruling before a target sentence
exists.

# GR-VAL: deferred rules

## R6.a: non-array `data.config` rejected
**Bucket:** php-semantics
**Who depends on it:** an editor client and any second implementation, both of
which need to know whether `config: "hello"` and `config: [1, 2]` are refused.
**Why deferred:** the rule is stated in terms of a host-language array, which
conflates a JSON object with a JSON list, since a list is an "array" and passes, but a
spec sentence saying "`config` must be a JSON object" would refuse it, so the two
readings accept different documents. Its carve-out for anchor-less nodes is
described in the registry as a consequence of where the guard sits relative to an
early return, which is an accident rather than a promise; both halves need a
ruling before either can be written.

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
**Who depends on it:** unknown; needs a ruling.
**Why deferred:** the family preamble states a whole-family evaluation order
(structure → node type → plugin → config → expressions → edge endpoints → edge
exposure → exposure map → terminal reachability). Nothing in the registry says a
result's errors are ordered, or that an earlier rule suppresses a later one, and
where a rule really does suppress another the row says so itself and that
suppression has been written into the rule. As a free-standing sentence the
ordering has no observable consequence, so it was not promoted to a rule.
Locator grammar and severity, the preamble's other two claims, *are* observable
and have been written onto each rule that depends on them instead.

# RT-BR: deferred rules

## BR-2 (in part): value-port detection when the source declares no branches
**Bucket:** accident-not-promise
**Who depends on it:** sources that declare no branch list, which the registry
says is the only reason the behaviour survives.
**Why deferred:** BR-2's three early-TRUE arms and the configured-branch authority
are extracted. The remaining clause (that when a source declares no branches at
all, a port is taken for a value port if its name is a key in the source's emitted
output) is flagged in the registry as wrong in both directions: it cannot see a
configured branch the run emitted no key for, and it misreads a branch that shares
a name with an emitted output key. Binding every future implementation to
reproduce it would promote a known-wrong fallback to a promise.

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

## INT-9 (in part): where snapshot access is enforced
**Bucket:** drupal-bound
**Who depends on it:** unknown; needs a ruling.
**Why deferred:** INT-9's upsert and cleanup halves are extracted. Its remaining
clause (that every snapshot query runs with entity access checks disabled because
access is enforced at the API layer instead, and that cleanup runs with no user
context) is a statement about which layer of a specific entity system performs
access control. The portable promise underneath ("snapshot access is enforced, and
enforced once") is not what the row says, so it is not written here.

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
primitives one implementation offers to authors of its own upgrade hooks. They are
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

# RT-OCX: deferred rules

## OCX-5: every written condition key is schema-valid
**Bucket:** drupal-bound
**Who depends on it:** the host framework's config schema validation and its strict-schema test mode; nothing on the wire.
**Why deferred:** The rule is about writing keys into a closed config mapping whose only extension point is an `ignore`-typed `custom` key, a config-install packaging and schema concern with no meaning outside that framework. Generalised into "stored configuration validates against its schema" it becomes vacuous, and a target that has no such schema layer cannot break it.

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

# RT-TOOL: deferred rules

## RT-TOOL-5: artifact collection is opt-in per run
**Bucket:** accident-not-promise
**Who depends on it:** unknown; needs a ruling. Nothing outside the
implementation can observe the registration itself; what a caller observes is
that artifacts arrive on some entry points and not others.
**Why deferred:** The rule exists because the collector's container is scoped per
process rather than per request, so an always-on map would retain payloads for the
process's lifetime on exactly the paths that never drain it. Promoting that into a
binding rule would make artifact delivery depend on which entry point launched the
workflow, a lifetime workaround, not a promise a second implementation should be
made to reproduce.

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
