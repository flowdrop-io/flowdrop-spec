# Contributing

Corrections are welcome, including "this rule is wrong", which is the most
useful thing you can file here.

Contributing to a specification differs from contributing to code in one way that
matters, so please read the next section before opening a pull request.

## Editorial or normative?

Every change is one or the other, and they are handled differently. Your pull
request must say which it is.

**Editorial**: the rule requires exactly what it required before, and now says so
more clearly. Fixing a typo, tightening a sentence, adding an example, correcting
a link, splitting a paragraph that buried something.

> Reviewed on its merits and usually merged.

**Normative**: an implementation that was conforming might now be failing, or the
reverse. Changing a limit, adding or removing a condition, making something
required that was optional, or resolving an ambiguity where two readings were both
defensible.

> Needs a **ruling** before it merges: a short record of what was decided and why,
> which becomes part of the specification. Please open an issue first. A normative
> pull request without prior discussion will usually be asked to become one.

If you are unsure which yours is, it is normative. The test: could an existing
implementation pass before your change and fail after it?

## Rule identifiers are permanent

`STORE-2` means one thing forever. Identifiers are cited from test suites, issue
trackers and other people's documents, so they are **never renumbered and never
reused**. In practice:

- Do not change the identifier of an existing rule.
- Do not reuse the number of a withdrawn rule.
- A new rule takes the next free number in its family.
- Withdrawing a rule means marking it withdrawn, not deleting the file.
- Do not issue a **reserved** number. See below.

CI enforces this against `rules/REGISTRY.lock`. When you add a rule, add its
identifier to that file in the same commit.

### Reserved identifiers

`REGISTRY.lock` records every identifier this specification has ever **issued or
blocked**. A blocked one is marked `reserved`: the number is in use in an
implementation's own rule registry for a rule this specification has ruled out of
its scope, so issuing it here would make one identifier mean two different things
in documents that cite each other. A reserved identifier has no rule file, CI
checks that it has none, and a new rule skips past it to the next free number.

Reserving is not a soft "not yet". If a rule the specification once declined turns
out to belong here after all, it is written as a **new** rule with a new number,
and `DEFERRED.md` records where it came from.

## What a normative proposal should say

Four things, briefly:

1. **Which rule**, by identifier.
2. **What changes**: the sentence before, and the sentence after.
3. **Why**: what is wrong today. "Nothing requires this limit; it came from one
   implementation's storage layer" is a good reason. "I would have designed it
   differently" is not, on its own.
4. **Blast radius**: what an implementation conforming today would have to change.
   Say so if the answer is "nothing".

## Writing rules

- **State the target, not what an implementation happens to do.** If a rule is
  describing a framework's behaviour, it is in the wrong document.
- **No implementation vocabulary.** A rule naming a class, a function, or a
  framework is a defect. Say "a request over 8 MiB is refused with 400", not
  "`decodeJsonRequest()` throws".
- **Prefer a floor to a ceiling** where a limit exists. "Must accept at least N"
  keeps implementations portable without freezing one system's arbitrary maximum
  into all the others.
- **Say the unit precisely.** Bytes, code points, and grapheme clusters are three
  different things; "characters" is not a unit.
- **A rule must be falsifiable.** If no implementation could be shown to break it,
  it says nothing. Delete it rather than publish a sentence that reads like a
  promise and is not one.

## Writing narrative

Narrative files are optional and most rules will not have all sections. **Say
nothing rather than say something thin**: a page that is a statement, one example
and a link is a good page. Empty headings invite padding, and padding is how the
one binding sentence gets buried.

References are for sources the rule actually takes something from. Boilerplate
every rule would otherwise repeat (HTTP status semantics, JSON, the meaning of
*must* and *may*) lives once in [`conventions.md`](conventions.md) and is never
cited per rule.

## Sign your commits (DCO)

Every commit must carry a `Signed-off-by` line certifying that you wrote the
contribution or otherwise have the right to submit it under this repository's
licences. This is the [Developer Certificate of Origin][dco]; there is no CLA.

    git commit -s -m "STORE-2: count code points, not bytes"

If you forget, `git commit --amend -s` on the last commit, or
`git rebase --signoff main` for a branch.

## Before you open the pull request

    npm install
    npm run validate

This checks the rule files against their schema, that no identifier moved, and
that narrative prose has not drifted from the rule text it explains.

## Licensing of contributions

Contributions to the specification text are licensed **CC BY 4.0**; contributions
to code are licensed **MIT**. Your sign-off is your agreement to this.

[dco]: https://developercertificate.org/
