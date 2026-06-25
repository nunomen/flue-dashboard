# flue-dashboard

Planning repository for a Flue workflow-run dashboard plugin.

This repository intentionally contains no implementation code yet. It captures
the agreed scope, architecture, and implementation skeleton for a future
Vue-based dashboard package targeting the latest Flue runtime.

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

## Documents

- [Requirements](docs/requirements.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Future Agent Sessions](docs/future-agent-sessions.md)

