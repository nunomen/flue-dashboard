# flue-dashboard

Implementation repository for a Flue workflow-run dashboard plugin.

This repository contains the initial Vue/Hono package scaffold for a workflow
run dashboard targeting the latest Flue runtime.

## Scope

The MVP is a workflow-run dashboard:

- browse workflow runs through Flue runtime APIs
- inspect run metadata and event history
- render lifecycle breadcrumbs, waterfall timelines, logs, errors, usage, and
  raw event details
- mount as an authenticated Hono sub-app in a Flue application

Agent session browsing is out of scope for the MVP. See
[docs/future-agent-sessions.md](docs/future-agent-sessions.md).

## Target

- Flue runtime: `@flue/runtime >=1.0.0-beta.6 <2`
- Server integration: Hono sub-app
- Frontend: Vue 3, TypeScript, Vite, Composition API, `<script setup>`

## Current Implementation

- `flueDashboard(options)` Hono sub-app with auth required by default
- dashboard API routes for health, run list, run detail, events, and optional
  stream proxy
- shared DTOs, event normalization, usage aggregation, and redaction helpers
- Vue dashboard shell with run filters, run table, run detail, timeline,
  waterfall, logs, and raw redacted event drawer
- Vitest coverage for normalization, redaction, and server route behavior

## Development

```sh
npm install
npm run typecheck
npm run test
npm run build
```

## Documents

- [Requirements](docs/requirements.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Installation](docs/install.md)
- [Security Notes](docs/security.md)
- [Future Agent Sessions](docs/future-agent-sessions.md)
