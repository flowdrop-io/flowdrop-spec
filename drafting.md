# Drafting rules

How a rule is written, and what a reviewer checks it against. Every check has an
identifier (`DR-4`) so a review finding can cite it. [`conventions.md`](conventions.md)
says how a reader interprets a rule; this file says how a writer produces one.

A rule that fails a check is a defect in the rule, whoever wrote it and whatever an
implementation does today.

## What belongs in a rule

**DR-1. Observable behaviour only.** A rule constrains what can be observed from
outside an implementation:
- what a request is answered with;
- what a stored workflow contains;
- what a run produces;
- what a consumer may rely on.

It never names how an implementation achieves that: no classes, functions,
modules, services, plugins, hooks, storage tables, entity types, caches,
configuration systems or framework concepts.

> Fails: "The resolver reads the gate flags from the plugin's configuration."
> Passes: "A parameter is connectable only where the node type declares it so."

**DR-2. The scope test.** A behaviour belongs in this specification when a workflow
author, an API client, or a run that crosses two implementations could observe a
difference. Where only some implementations offer a capability, the rule is
`level: optional` or carries a narrower profile. A behaviour nobody outside an
implementation can observe belongs in that implementation's own documentation.

**DR-3. Minimal by default.** A rule states the least that every conforming
implementation must share. An implementation adds to it (see
[Extensibility](conventions.md#extensibility)); the rule does not pre-empt the
additions.

## How a requirement is stated

**DR-4. Key words.** Every normative sentence that binds carries a BCP 14 key word in
capitals (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY). Key words appear only in
normative text, never in a title, summary or narrative page.

**DR-5. One requirement per sentence.** A sentence carries one requirement. Two
requirements joined by "and" become two sentences, unless they are one condition
that is tested as one.

**DR-6. Testable.** For every MUST and MUST NOT, a reader can say what observation
would show an implementation breaking it: a status code, a payload, a stored value,
a run outcome. A requirement nobody could be shown to break says nothing and is
deleted.

**DR-7. Present tense, no history.** A rule states what is required now. It does not
say what used to be required, what an implementation did before, or why something
changed:
- **why it changed** belongs in a ruling;
- **how to treat old input an implementation may still meet** belongs in the
  informative legacy appendix, [`legacy.md`](legacy.md).

Words that signal a failure here: *legacy*, *formerly*, *used to*, *no longer*,
*was*, *originally*, a version number of any implementation.

## Words

**DR-8. Every term is defined.** A term with a specific meaning is defined in the
glossary or in the rule itself. A reader who knows JSON, HTTP and JSON Schema, and
nothing about any implementation, can follow every rule.

**DR-9. One term per concept.** A concept has one name everywhere, and a name means
one concept. Two words for one thing (or one word for two things) is a defect, even
where both are defined.

**DR-10. No host-language semantics.** A rule does not inherit the habits of the
language an implementation is written in. In particular:
- **Absent vs null:** state which is meant ([Payloads](conventions.md#payloads)).
  Never assume that a missing key and a `null` value are interchangeable, or that
  every declared key is present.
- **JSON shape:** say *object* or *array*, never a word that could mean either.
- **Numbers:** say *integer* or *number*, and give a range where size matters.
- **Text:** give the unit ([Counting text](conventions.md#counting-text)).

## Shapes and sets

**DR-11. Presence, not order.** A rule that lists an object's members states which
are present. It does not state an order, and the words *in that order* and *in the
same order* do not appear, unless the order is observable through something other
than member order, and the rule says why it is required.

**DR-12. Open or closed, explicitly where it matters.** A list of members or values
is open by default ([Extensibility](conventions.md#extensibility)). A rule that
needs a closed list says *closed* and gives the reason a consumer depends on
completeness. A rule never uses *exactly* to mean "closed" by implication. Where it
means closed, it says closed.

**DR-13. Numbers have a reason.** Every specific number in a normative sentence is
either:
- a floor ("MUST accept at least 255 code points"), see
  [Limits](conventions.md#limits);
- or justified in the rule's narrative or a ruling.

A maximum one implementation happened to choose is a floor in disguise, and is
written as one.

**DR-14. Uniform unless argued otherwise.** Where a rule treats one kind of thing
differently from its siblings (dynamic ports against declared ports, one limit
against the others), it names the general behaviour it departs from and says why.
Without a reason, the special case is a defect.

## Relations between rules

**DR-15. No contradictions.** A rule does not contradict another rule, a convention
or a ruling. Where two rules meet, each cites the other in `related`, and the
narrower one says it is the exception.

**DR-16. No duplicates.** A requirement is stated once. Another rule that depends on
it cites it by identifier rather than restating it.

**DR-17. References carry their weight.** A rule cites an external source only for
something it takes from that source, and says what. Sources every rule depends on
(BCP 14, HTTP, JSON) live once in [`conventions.md`](conventions.md) and are never
cited per rule.

## Two tests to run on every rule

**DR-18. The outsider test.** Could someone implement this rule correctly from its
text, the conventions and the glossary alone, in a language and framework unlike
any existing implementation's? If they would need to read an implementation to
find out, the rule is incomplete.

**DR-19. The debugger test.** Could someone debugging a workflow, a person or an
agent, decide from this rule alone whether an observed behaviour is correct, and so
whether to file a bug and against whom? If two readings are defensible, the rule is
ambiguous.

## Who a rule is written for

**DR-20. Every language, not one codebase.** FlowDrop is implemented in several
languages, and more will follow: PHP, JavaScript and Rust today, Python, Go or any
other tomorrow. A rule states the behaviour that is right for all of them, and
makes no compromise for the sake of an existing implementation:
- the effort of a refactor is not a reason to keep a weaker, looser or more
  complicated rule;
- neither is what an implementation does today (DR-7), nor a habit of the
  language it is written in (DR-10).

Where the right rule breaks what an implementation does now, the rule changes
anyway, through a ruling. The implementation adopts it in its next major release,
with a migration path for stored workflows and for callers. How to read the old
form goes in the informative legacy appendix, [`legacy.md`](legacy.md), never in
the rule.

**DR-21. JSON Schema says it where it can.** Workflow contracts, port schemas and
payload shapes are JSON Schema (2020-12). Where JSON Schema can express a
requirement, a rule takes JSON Schema's meaning for it (`required`, `type`, `null`,
`default`, `enum` and the rest), so that an off-the-shelf validator, in any
language, gives the same verdict as the specification. A rule that departs from
JSON Schema names the departure and its reason, and the departure is listed in
[Absent, null and empty](conventions.md#payloads). Every departure is a check each
implementation has to write by hand, so the first remedy is to change the rule, not
to keep the departure.
