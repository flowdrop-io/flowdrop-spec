# Legacy

Surfaces and data that are no longer part of this specification, and what to make
of them when they turn up. This appendix is informative. It requires nothing; it
helps a reader, a person or an agent, who meets old traces, old payloads or old
documentation and needs to know whether something is wrong.

Each entry names the withdrawn rules it replaces. Those rules stay citable, and
their pages say the same in short.

## The per-node-type configuration check

Withdrawn rules: API-4, R6.k (rewritten; see below).

Some implementations once offered an endpoint that judged a node's configuration on
its own, before save, without the node's edges. Because it could not see the edges,
it reported problems that the save then accepted.

**If you meet it:** a request to such an endpoint, or a verdict it returned, says
nothing about whether the workflow is valid. Only save-time validation decides that
(R6, R11). An implementation that still serves such an endpoint is offering an
extension, not a FlowDrop surface, and a client that relies on it relies on that
implementation alone. R6.k still
requires that no save is gated on a check of this kind.

## The polled status surface

Withdrawn rules: ST-1 to ST-9.

Some implementations once offered a status endpoint that a client polled for an
execution's status and for each node's status: a `{success, data}` envelope, an
execution report (`status`, `workflow_id`, `node_count`, `start_time`, `end_time`,
`total_execution_time`, `error`), a node report (`status`, `node_id`, `node_type`,
`start_time`, `end_time`, `execution_time`, `error`, `output`), and detail metrics.
Its statuses were `initialized`, `idle`, `running`, `completed`, `failed` and
`interrupted`.

**If you meet it:** a trace or a client that polls this surface comes from before
it was retired. A run's progress is read from the pipeline and snapshot surfaces
(RT-PIPE, RT-SNAP), and a missing status endpoint is not a defect. The key
`node_type` in such a payload is that surface's own spelling; every current payload
says `node_type_id` (STORE-13).

## Empty values read as absent

Rules: BR-1, BR-2, EDGE-5, STORE-9, INT-6 (ruling OPEN-26).

Some implementations once treated an empty value as if the member had not been
sent: an empty active-branch list followed every edge, an empty `data.edgeType`
fell back to the handle, an empty flow id in a bundle had a new one minted, and a
snapshot of a run with no workflow carried an empty version that skipped the
version check.

**If you meet it:** a stored workflow with `"edgeType": ""`, or a bundle with
`"id": ""`, is refused by a conforming implementation. Remove the member to get the
fallback. A snapshot with an empty version is compared like any other. An
implementation that still reads these the old way says so in its release notes,
with the release that changes it and how to migrate.

## A parameter's null read as missing

Rules: CFG-3, CFG-9, CFG-10, CFG-14, DYN-4, R6.i (ruling OPEN-26).

Some implementations once resolved a parameter that nothing supplied to `null`,
failed a required parameter whose value was `null` as missing, and skipped schema
validation for a `null` altogether, at save and at run time.

**If you meet it:** a processor that receives every declared parameter, unsupplied
ones as `null`, or a save that accepts `null` for a `"type": "string"` key, comes from
that reading. Under the current rules an unsupplied parameter is absent, and a `null`
passes only a schema whose type admits it. A workflow that relied on the old reading
gives such a parameter a type like `["string", "null"]`.

