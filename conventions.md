# Conventions

Vocabulary and references shared by every rule, stated once here so no rule has to
repeat them.

## Requirement levels

**must**: an absolute requirement. An implementation that does not do this does
not conform.

**must not**: an absolute prohibition.

**should**: a strong recommendation. There may be valid reasons to do otherwise;
understand them before choosing.

**may**: genuinely optional. An implementation that does this and one that does
not are both conforming, so a caller cannot rely on it.

These words carry this meaning only in a rule's normative sentence. In narrative
prose they are ordinary English.

## Refusals

Where a rule says a request is **refused with `400`**, `409`, `422` and so on, the
number is an HTTP status code with the meaning given in **RFC 9110, HTTP
Semantics**. A refusal never partially applies: if a request is refused, nothing
it asked for has taken effect.

## Validation results

A validation result's errors carry **no defined order**. Two implementations
refusing the same workflow may report the same errors in different sequences, and
one implementation may change its own order without notice, so a consumer must not
depend on it. Where a rule needs an error to be identifiable, it says so by naming
the code and the locator, never the position.

## Authoring surfaces

Some rules address what an authoring surface does. They constrain **the data such a
surface may produce** — what it may record, and what it must not — and never how it
presents controls. Widget shape, layout, enablement and the order things appear in
are an implementation's own affair, and a rule that could only be satisfied by
building a particular control is a defect in the rule.

## Payloads

Request and response bodies are JSON, as defined in **RFC 8259**.

## Counting text

Where a rule bounds the length of a string, it counts **Unicode code points**
unless it says otherwise. Not bytes, which would make a limit depend on the
alphabet the text is written in; and not grapheme clusters, which are closer to
what a person calls a character but much harder for two implementations to agree
on.

## Identifiers

Rules are cited by identifier (`STORE-2`, `SCH-41`), grouped by family prefix.
An identifier is permanent: never renumbered, never reused, still citable after
the rule is withdrawn.

## Rulings

A change to what implementations must do is recorded as a **ruling**: what was
decided, and why. Rules affected by a ruling reference it. A ruling is history and
is never rewritten; where it turns out to be wrong, a later ruling supersedes it
and says so.

Rulings are carried here, in this specification, and each one has a page of its
own. A rule citing a ruling that is not written down states a requirement whose
reasoning the reader cannot check, which is the situation this convention exists
to prevent.

A ruling identifier is permanent on the same terms as a rule identifier: never
renumbered, never reused, still citable after the ruling is superseded. The two
live in separate namespaces, so no identifier is ever both.

A ruling settles what is required. It does not say who has implemented it, or
when: that is each implementation's own to publish, and appears nowhere here.

## Profiles

Not every rule binds every kind of implementation. A rule declares the profiles it
applies to:

- **runtime**: executes workflows.
- **storage-api**: stores workflows and serves them over the API.
- **editor-client**: authors workflows against the API.

## Levels

- **core**: the set an implementation is expected to meet before calling itself a
  FlowDrop implementation.
- **extended**: beyond core; commonly expected, not assumed.
- **optional**: genuinely optional capability.

## Posture

A rule declares how it is meant to be read.

- **normative-target**: the rule states what a conforming implementation must do.
  This is what almost every rule is, and what a reader should assume where the
  question does not arise. A target does not become less binding because no
  implementation has met it yet.
- **descriptive**: the rule records what implementations do rather than requiring
  it. Nothing here is a requirement, and a reader must not treat it as one.
- **deprecated**: the rule still holds, and something else is preferred. It is
  kept so that it stays citable.
- **withdrawn**: the rule no longer holds. The identifier is never reused, so the
  rule is kept rather than deleted, and says what replaced it.

Posture is about the rule's standing in this document, and never about any
implementation's progress against it.
