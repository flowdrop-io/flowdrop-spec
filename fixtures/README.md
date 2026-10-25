# Fixtures

Test cases an implementation can run, so a rule can be checked by code as well as
read. They are informative. Where a case and a rule disagree, the rule is right and
the case is a bug: report it.

Each case is one file, `fixtures/<suite>/<case>.json`, valid against
[`schema.json`](schema.json). `npm run validate` checks every case against it, and
checks that each rule a case names exists and is not withdrawn. Each rule's page on
the site lists the cases that name it.

| Member | Meaning |
|---|---|
| `title` | What the case shows, in one line. |
| `rules` | The rules whose text decides the outcome. |
| `operation` | What to run. Defined below. |
| `given` | The input to the operation. |
| `expect` | The outcome. |
| `note` | Why, where the title does not say it. |

## Reading a case

A case is written in the states of conventions.md, "Absent, null and empty", and is
compared in them too. `expect` is compared with the outcome by deep equality:

- A member present in `expect` is present in the outcome, with an equal value.
  `null`, `""`, `[]`, `{}`, `false` and `0` are values, each equal only to itself.
- A member absent from `expect` is absent from the outcome. There is no
  "don't care": where an operation's outcome could carry more, the operation below
  names the members it is compared on, and only those.
- Arrays compare in order, except where an operation below says otherwise.

An implementation runs a case through a small adapter of its own that maps `given`
onto its API and its result back onto `expect`'s shape. Where the specification
names a member (`sourceHandle`, `active_branches`, `tool_call_id`), a case uses that
name. Where it names none, the member name is the adapter's to map, and is
explained below.

## Suites

| Suite | Covers |
|---|---|
| `presence` | Absent, `null`, empty and a value: through every priority of parameter resolution, through declared inputs and outputs, and in each rule ruling OPEN-26 or OPEN-27 aligned. |

## Operations

### `resolve-parameters`

Resolve one node's parameters (GR-CFG).

- `given.parameters`: the node type's parameters by name. Each carries `schema` (the
  processor's parameter schema for it, whose `default` is the schema default), and,
  where the node type records them, `default` (the node type's recorded default,
  CFG-3), `connectable`, `configurable`, `required`, `exposed` (whether its input
  port is exposed by default; every parameter states it, CFG-2) and `when_missing`. A
  gate flag or `when_missing` the case leaves out is not recorded, and takes the value
  CFG-1 or CFG-20 gives it.
- `given.dynamicParameters`: the node's dynamic parameter definitions, as DYN-2 defines them (CFG-15, DYN-8).
- `given.config`: the node's saved configuration. `given.inputs`: the runtime inputs.
  Either may be left out, meaning an empty object.
- Outcome, one of:
  - `{"resolved": {...}}`, the resolved parameter set (CFG-14);
  - `{"failed": {"parameter", "error", "constraint"?}}`, the node execution failed;
    `error` is `missing-parameter` (CFG-9) or `validation` (CFG-10), and
    `constraint` names the constraint that failed;
  - `{"skipped": true}`, the node was recorded as skipped (CFG-21).

### `collect-outputs`

Collect a workflow's declared outputs from its run (MAN-17).

- `given.outputs`: the output manifest entries (MAN-2).
- `given.produced`: what each node produced, by node identifier, then port name. A
  port that is not a key produced nothing.
- Outcome: `{"result": {...}}`, the declared outputs by name.

### `resolve-launch-inputs`

Check a caller's launch inputs and map them onto the workflow's initial data
(MAN-11, MAN-15, MAN-16).

- `given.inputs`: the input manifest entries. `given.supplied`: what the caller sent.
- Outcome, one of:
  - `{"initialData": {...}}`, by node identifier, then port name;
  - `{"refused": {"stage", "inputs"}}`, where `stage` is the MAN-15 stage that
    failed (`undeclared`, `missing` or `value`) and `inputs` the inputs it names, in
    any order. The message text is not compared.

### `extract`

Evaluate a `$`-rooted JSONPath extraction with extract-all off (LANG-9, LANG-23,
LANG-24).

- `given.data`: the context. `given.path`: the query. `given.default`: the
  configured default, left out where none is configured.
- Outcome: `{"value"?, "success"}`. `value` is absent where nothing was delivered.

### `update-workflow`

Update a stored workflow through the API, then read it back (STORE-4).

- `given.stored`: the workflow as stored. `given.request`: the update request body.
- Outcome: `{"workflow": {...}}`, compared on `name`, `nodes` and `edges` only.

### `read-edge`

Store a workflow carrying one edge, then read the edge back (EDGE-2, EDGE-9).

- `given.edge`: the edge as submitted.
- Outcome: `{"edge": {...}}`, compared on `source`, `target`, `sourceHandle` and
  `targetHandle` only.

### `validate-snapshot`

Validate a snapshot against a workflow definition whose nodes the snapshot matches,
so only the version check can fail (INT-8).

- `given.definitionVersion`: the definition's workflow version (INT-7).
- `given.snapshot.workflowVersion`: the snapshot's workflow version, left out where
  the snapshot carries none. The member name is the adapter's to map.
- Outcome: `{"valid", "versionMismatch"}`.

### `text-to-message`

Run a text-to-message node (MEM-16).

- `given.text`, `given.role`, `given.tool_call_id`: its inputs; a member left out is
  not supplied.
- Outcome: `{"message": {...}}`, the one message, compared on `role`, `content` and
  `tool_call_id` only.

### `gate-edge`

Decide whether an edge leaving a named source port is followed (BR-1, BR-2, BR-3).

- `given.branches`: the source's configured branches. `given.output`: the source's
  output. `given.port`: the edge's source port name.
- Outcome: `{"follow": true}` or `{"follow": false}`.

### `overlay-metadata`

Build an input's contract fragment from a bound port and overlay the entry's author
metadata on it (MAN-6).

- `given.port`: the bound port's annotations (`title`, `description`, `examples`).
- `given.entry`: the input manifest entry's author metadata, the same three members.
- Outcome: `{"annotations": {...}}`, the fragment read with annotation requested,
  compared on `title`, `description` and `examples` only.

### `validate-exposure`

Validate a workflow whose input exposure is `given.inputs` and whose output exposure
is empty (R4).

- Outcome: `{"errors": [{"code", "at"}]}`, every error the exposure checks yield, in
  any order.
