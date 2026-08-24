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
