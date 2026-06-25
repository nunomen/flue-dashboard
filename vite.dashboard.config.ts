import type { ServerResponse } from 'node:http'
import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'

import { normalizeRunEvents, normalizeRunRecord, normalizeRunSummary } from './src/shared'
import { fixtureRuns } from './tests/fixtures/runs'

export default defineConfig(({ command }) => ({
  root: resolve(import.meta.dirname, 'src/dashboard'),
  plugins: [
    vue(),
    command === 'serve' ? fixtureDashboardApi() : undefined,
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src/dashboard'),
      '@shared': resolve(import.meta.dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist-dashboard'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022',
  },
}))

function fixtureDashboardApi(): Plugin {
  return {
    name: 'flue-dashboard-fixture-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost')

        if (!url.pathname.startsWith('/api/')) {
          next()
          return
        }

        if (url.pathname === '/api/health') {
          sendJson(response, 200, { ok: true, runtime: { configured: true } })
          return
        }

        if (url.pathname === '/api/runs') {
          sendJson(response, 200, { runs: fixtureRuns.map(normalizeRunSummary) })
          return
        }

        const eventMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/events$/)
        if (eventMatch?.[1]) {
          const run = fixtureRuns.find((candidate) => candidate.id === decodeURIComponent(eventMatch[1]))
          sendJson(response, 200, normalizeRunEvents(eventMatch[1], run?.events ?? []))
          return
        }

        const runMatch = url.pathname.match(/^\/api\/runs\/([^/]+)$/)
        if (runMatch?.[1]) {
          const run = fixtureRuns.find((candidate) => candidate.id === decodeURIComponent(runMatch[1]))

          if (!run) {
            sendJson(response, 404, { error: { message: 'Run was not found.' } })
            return
          }

          sendJson(response, 200, { run: normalizeRunRecord(run) })
          return
        }

        sendJson(response, 404, { error: { message: 'Fixture API route was not found.' } })
      })
    },
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}
