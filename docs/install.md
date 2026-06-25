# Installation

This package exports a Hono sub-app that can be mounted inside a host Flue
application.

```ts
import { Hono } from 'hono'
import { flueDashboard } from 'flue-dashboard'

const app = new Hono()

app.route('/admin/flue', flueDashboard({
  runtime: {
    listRuns: () => flue.listRuns(),
    getRun: (runId) => flue.getRun(runId),
    listRunEvents: (runId, options) => flue.listRunEvents(runId, options),
  },
  auth: async (context, next) => {
    const user = context.get('user')
    if (!user?.admin) {
      return context.json({ error: { message: 'Unauthorized' } }, 401)
    }

    await next()
  },
}))
```

## Runtime Source Contract

The dashboard currently depends on these server-side methods:

- `listRuns()`: returns an array, or an object with `runs`, `items`, or `data`.
- `getRun(runId)`: returns a single run record, or `null` when missing.
- `listRunEvents(runId, options)`: optional. Returns an array, or an object with
  `events`, `items`, or `data`.
- `streamRunEvents(runId)`: optional. Returns a `Response` or `ReadableStream`.

The browser only calls dashboard-owned `/api/*` routes. Privileged Flue access
stays in the host application's server runtime.

## Local Development

Run the dashboard frontend directly with:

```sh
npm run dev
```

The Vite dev server includes fixture `/api/*` responses so the UI can be
worked on before it is mounted in a host Flue application.

Build and verify the package with:

```sh
npm run typecheck
npm run test
npm run build
```

`unsafeDevMode: true` can be used for local fixture work, but production mounts
should always provide `auth`.
