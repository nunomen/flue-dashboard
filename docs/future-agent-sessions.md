# Future Agent Sessions

Agent session browsing is intentionally out of scope for the MVP.

## Why

Latest Flue exposes workflow-run listing through `listRuns()` and individual
workflow records through `getRun(runId)`. It also exposes agent definitions
through `listAgents()`.

`listAgents()` lists built agent definitions, not historical agent instances.
It can answer which agent types exist, but it cannot answer which instance IDs
have streams or sessions.

Agent streams are readable when the caller already knows:

- agent name
- instance ID

The stream route is `/agents/:name/:id`, but Flue does not currently expose a
public historical list of all agent instance IDs.

## Do Not Use Private Storage Tables

Some runtime backends store event stream paths such as `agents/<name>/<id>`.
The dashboard should not query those private tables because:

- the public `EventStreamStore` contract does not include path enumeration
- Cloudflare does not centralize agent streams in the workflow run registry
- private table shapes may change across Flue releases
- relying on internals would make the package fragile

## Future Options

Agent session browsing can be revisited if one of these exists:

- Flue adds a public session or agent-instance listing API.
- The host application provides a `sessionSource` adapter.
- The dashboard adds an optional `observe(...)`-based session index.

The MVP should keep extension points open without requiring extra storage.

