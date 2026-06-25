# Implementation Plan

## Package Skeleton

- `package.json`: package metadata, peer dependencies, scripts, and exports.
- `src/server/`: Hono route package.
- `src/dashboard/`: Vue app source.
- `src/shared/`: shared event/run types and normalization utilities.
- `docs/`: install guide, security notes, future-agent-session notes.
- `tests/`: unit, route, and UI smoke tests.

## Server Responsibilities

- Export `flueDashboard(options)`.
- Require an `auth` middleware option by default.
- Serve the compiled Vue static assets.
- Provide dashboard API routes that wrap Flue runtime APIs.
- Keep privileged Flue access on the server side.

## Dashboard API Shape

- `GET /api/runs`: list workflow-run summaries from `listRuns()`.
- `GET /api/runs/:runId`: return `getRun(runId)`.
- `GET /api/runs/:runId/events`: return full or tailed event history.
- `GET /api/runs/:runId/stream`: optional live stream proxy.
- `GET /api/health`: lightweight diagnostics endpoint.

API responses should use dashboard-owned DTOs rather than leaking raw Flue
objects through every UI path.

## Shared Normalization

Convert Flue events into UI-friendly records for:

- lifecycle events
- operations
- model turns
- tool calls
- delegated tasks
- compactions
- logs
- terminal results and errors

Derived summaries should include:

- status
- duration
- error count
- warning count
- model usage and cost
- slowest operations
- event counts by type

Raw events may be available in a raw event drawer, but sensitive fields should
be collapsed by default.

## Vue App Structure

- `main.ts`: mount the Vue app.
- `App.vue`: app shell only.
- `views/DashboardView.vue`: route-level composition for run list and selected
  run detail.
- `components/runs/RunTable.vue`: run list, status, duration, started time, and
  workflow name.
- `components/runs/RunFilters.vue`: status, workflow, search, and limit controls.
- `components/runs/RunDetail.vue`: selected run composition surface.
- `components/runs/RunSummaryStrip.vue`: key metrics.
- `components/events/EventTimeline.vue`: chronological breadcrumbs.
- `components/events/EventWaterfall.vue`: span and waterfall visualization.
- `components/events/EventLogList.vue`: logs, errors, and warnings.
- `components/events/RawEventDrawer.vue`: raw event payload inspection.
- `components/common/`: buttons, badges, empty states, loading states, and error
  panels.

## Vue Composables

- `useRuns()`: fetch, filter, and paginate run summaries.
- `useRunRecord(runId)`: load selected run metadata.
- `useRunEvents(runId)`: load and optionally refresh events.
- `useRunStream(runId)`: manage live stream connection if implemented.
- `useRunTimeline(events)`: derive ordered breadcrumbs.
- `useRunWaterfall(events)`: derive span layout model.
- `useRunUsage(events)`: derive tokens, cost, and model summary.
- `useDisclosureState()`: manage drawer and panel state where needed.

Composable APIs should return readonly state plus explicit actions.

## Vue Rules

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Keep route and root components thin.
- Use props down and events up.
- Use `computed` for filtered, sorted, and derived state.
- Use watchers only for side effects such as refetching after run ID changes.
- Use `shallowRef` for large raw event payloads or external opaque structures.
- Use scoped styles in single-file components.
- Keep global CSS limited to resets, tokens, and layout primitives.

## UI Behavior

- First screen shows the run table and selected run detail.
- Filters should be compact and persist within the current page session.
- Selecting a run updates detail without losing filter state.
- Detail view shows summary first, then timeline, waterfall, logs, and raw event
  access.
- Raw payloads are collapsed by default and require deliberate expansion.
- Empty, loading, failed, unauthorized, and not-found states must be designed.

## Visualization Plan

- Use a waterfall/span timeline, not a CPU flamegraph.
- Layout spans by timestamps when possible.
- Fall back to event order when timing is incomplete.
- Correlate with `operationId`, `turnId`, `toolCallId`, `taskId`, `session`, and
  `parentSession`.
- Visually distinguish lifecycle, operation, model, tool, task, log, and error
  events.

## Security

- Dashboard route must be protected by host auth.
- No public unauthenticated default.
- Do not render model thinking deltas as ordinary user-facing text.
- Collapse or redact large and sensitive fields:
  - workflow input
  - workflow result
  - prompts
  - messages
  - tool arguments
  - tool results
  - errors
- Document that run data can contain sensitive application and model content.

## Build

- Vite builds the Vue app into static assets.
- Server package serves those assets from the Hono sub-app.
- Package exports server API and shared types.
- Build output is generated and should not be hand-edited.

## Testing

- Unit tests for event normalization and usage summaries.
- Unit tests for redaction and payload collapse helpers.
- Hono route tests for auth, run listing, run detail, event reads, and errors.
- Vue component tests for table, detail, and timeline states.
- Playwright smoke test for the built dashboard with fixture run data.

## Documentation

- Installation guide with Hono mount example.
- Security and auth guide.
- Flue API compatibility notes.
- Future agent-session browsing note.

