# Requirements

## Decisions

1. Target latest Flue, currently `@flue/runtime@1.0.0-beta.6`.
2. Build a runtime integration package, not a Flue CLI or Vite plugin.
3. Export a Hono sub-app mounted by the host application.
4. Recommend mounting at `/admin/flue`, but leave route choice to callers.
5. Fail closed: require host-provided admin auth or an explicit unsafe dev mode.
6. MVP scope is workflow runs only.
7. Agent session browsing is out of scope for MVP.
8. Do not rely on private Flue storage tables for agent-session discovery.
9. Use Flue APIs directly; no dashboard-owned database in MVP.
10. Use `listRuns()`, `getRun(runId)`, and `/runs/:runId` event streams.
11. Browser calls dashboard API routes; server-side code talks to Flue runtime.
12. Use waterfall/span timeline plus breadcrumbs, not a CPU-style flamegraph.
13. Core screens: overview, run list, run detail, event timeline, waterfall,
    logs/errors, usage/cost summary, raw event drawer.
14. Show metadata first. Collapse or redact sensitive and large fields by default.
15. Frontend stack is Vue 3 + TypeScript + Vite, using Composition API and
    `<script setup>`.
16. Design should feel like an operational admin tool: dense, quiet, scannable,
    and built for repeated inspection.
17. Peer dependencies should include `@flue/runtime >=1.0.0-beta.6 <2` and
    `hono`.
18. No storage in MVP.
19. Support Cloudflare by avoiding Node-only storage assumptions.
20. Test event normalization, redaction, routes, and UI smoke behavior.
21. Project lives at `~/projects/flue-dashboard`.
22. Include future documentation for agent-session browsing.

## Non-Goals

- No custom telemetry backend for MVP.
- No Flue CLI or Vite plugin implementation.
- No agent-session index in MVP.
- No direct browser access to privileged Flue inspection APIs.
- No dependency on private Flue SQL tables or generated internals.
