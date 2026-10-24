# Extensions

Members and values that implementations add to lists this specification leaves
open. This register is informative: listing a name adds no requirement. It exists so
that the specification never gives a listed name another meaning, and so that two
implementations adding the same name learn of the clash here rather than from each
other's payloads ([Extensibility](conventions.md#extensibility)).

To add an entry, give the name, where it appears, what it means, and which
implementation adds it.

## Workflow documents

Where: every surface that returns a workflow (STORE-14).

- **`revision`**: a string that changes whenever the stored workflow changes. A
  client that sends it back on a save asks for the save to be refused with `409` if
  the workflow changed on the server since the client read it. A save without it is
  not checked. Added by FlowDrop for Drupal.
- **`can`**: an object of booleans saying what the requesting user may do with the
  workflow: `save` and `run`. It describes the caller, not the workflow, so two users
  reading the same workflow can see different values. Added by FlowDrop for Drupal.

## Sessions

Where: the session row (PLAY-2).

- **`thirdPartySettings`**: an object of settings that other components keep on a
  session, keyed by the component and then by setting. An empty object where there
  are none. Added by FlowDrop for Drupal.

## Session messages

Where: the message row (PLAY-4).

- **`origin`**: a string naming which component posted the message: `user` (a person
  typed it), `workflow` (the workflow produced it), `engine` (the run machinery wrote
  it), `playground` (a console wrote it for its own viewers), or `interrupt` (an
  interrupt asked a question). It is a separate axis from `role`, which says who spoke
  in the conversation. Added by FlowDrop for Drupal.
