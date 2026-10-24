# Conventions

Vocabulary and references shared by every rule, stated once here so no rule has to
repeat them.

## Requirement levels

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT** and **MAY** in this
specification are to be interpreted as described in **BCP 14** (RFC 2119, RFC 8174)
when, and only when, they appear in all capitals, as shown here. This specification
uses no other BCP 14 key words.

In plain terms:

- **MUST** is an absolute requirement, and **MUST NOT** an absolute prohibition. An
  implementation that does not meet one does not conform.
- **SHOULD** is a strong recommendation, and **SHOULD NOT** a strong
  recommendation against. There may be valid reasons to do otherwise; understand
  them before choosing.
- **MAY** is genuinely optional. An implementation that does this and one that
  does not are both conforming, so a caller cannot rely on it.

The same words in lower case are ordinary English and bind nothing.

## Normative and informative text

A rule's **normative** text, these conventions, and the **decision** of a ruling
are normative. Everything else is informative: a rule's title and summary,
narrative pages, examples, notes, the glossary's explanations, and a ruling's
question. Informative text explains; it never adds a requirement. Where the two
disagree, the normative text wins and the disagreement is a defect to report.

## Conformance

An implementation declares the **profiles** it implements and the **level** it
claims. It conforms when it meets every requirement of every rule that belongs to
one of those profiles, at the claimed level and every level below it. A rule that
is withdrawn does not bind.

## Refusals

Where a rule says a request is **refused with `400`**, `409`, `422` and so on, the
number is an HTTP status code with the meaning given in **RFC 9110, HTTP
Semantics**. A refusal never partially applies: if a request is refused, nothing
it asked for has taken effect.

## Validation results

A validation result's errors carry **no defined order**. Two implementations
refusing the same workflow may report the same errors in different sequences, and
one implementation may change its own order without notice, so a consumer MUST NOT
depend on it. Where a rule needs an error to be identifiable, it says so by naming
the code and the locator, never the position.

## Authoring surfaces

Some rules address what an authoring surface does. They constrain **the data such a
surface may produce** (what it may record, and what it must not) and never how it
presents controls. Widget shape, layout, enablement and the order things appear in
are an implementation's own affair, and a rule that could only be satisfied by
building a particular control is a defect in the rule.

## Payloads

Request and response bodies are JSON, as defined in **RFC 8259**.

**Member order.** A JSON object's members have no order (RFC 8259 §4). Where a
rule lists the members of an object, it states which members are present, never
the order they appear in. A consumer MUST NOT depend on member order. The order of
an array's elements is significant only where the rule says what it means.

**Absent, null and empty.** A member of an object is in one of four states. The
definitions bind every payload in this specification: requests, responses, stored
workflows and run results.

| State | JSON | Meaning |
|---|---|---|
| Not provided | the member is absent | A fallback a rule gives for it applies: a lower priority, a default. |
| Provided, no value | `null` | A choice. It takes the place of any fallback. In a partial update it clears the stored value. |
| Provided, empty | `""`, `[]`, `{}`, `false`, `0` | A value, like any other. |
| Provided, with content | anything else | A value. |

No rule reads an empty value as absent or as `null`. A member moves from one state
to another only where a rule says so, as when a default fills an absent member. An
implementation MUST NOT otherwise drop a `null` or empty member, or fill an absent
one, when it reads, stores or writes a payload.

Where these states meet JSON Schema, they agree with it: *required* is met by a
member that is present, and `null` is a value of its own type, which passes `type`
only where the type admits it. There are no exceptions. A node parameter reads the
states the same way: one that nothing supplies is absent (CFG-14), *required* is met
by a present `null` (CFG-9), and the parameter's schema decides whether that `null`
is acceptable (CFG-10, R6.i). A rule that needs "a value, not `null`" says so with a
type that does not admit `null`.

**Equal values.** Where a rule compares two JSON values, they are equal as JSON
Schema's `const` and `enum` compare them: they are of the same JSON type, and two
strings are equal code point by code point, two numbers are equal by numeric value
(`1` and `1.0` are equal), two arrays hold equal items in the same order, and two
objects have the same member names with equal values, whatever their order. There is
no conversion between types, so `"1"` is not equal to `1`, and `true` is not equal
to `1`. A host language's own equality operator gives this answer only in some of
these cases, so an implementation compares by this definition, not by its operator.

## Extensibility

**Lists are open unless a rule says they are closed.** Where a rule lists the
members of an object, or the values a field may take, an implementation MAY add
members or values of its own. An addition MUST NOT change the meaning of anything
the specification defines. A consumer MUST ignore a member it does not recognise,
and MUST NOT fail solely because it meets a value it does not recognise in an open
list.

**Added names are registered.** A member or value that an implementation adds
SHOULD be listed in [`extensions.md`](extensions.md), with what it means and which
implementation adds it. The specification never gives a listed name another
meaning, and two implementations adding the same name learn of the clash from the
register rather than from each other's payloads.

**A closed list is exhaustive.** Where a rule says a list is closed, an
implementation MUST NOT add to it, and a consumer MAY treat anything outside it as
an error. A rule closes a list only where an addition would break a consumer that
relies on the list being complete, and says why.

## Limits

Where a rule says an implementation MUST accept **at least** some amount (a
length, a count, a size), the amount is a floor. An implementation MAY accept more.
Beyond its own limit it refuses as the rule says. A caller that stays within the
floor can rely on every conforming implementation accepting the request.

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
- **withdrawn**: the rule no longer holds. The identifier is never reused, so the
  rule is kept rather than deleted, and says what replaced it.

Posture is about the rule's standing in this document, and never about any
implementation's progress against it.
