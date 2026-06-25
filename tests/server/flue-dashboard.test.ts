import { describe, expect, it } from 'vitest'
import type { MiddlewareHandler } from 'hono'

import { flueDashboard } from '../../src/server'
import { fixtureRuntime } from '../fixtures/runs'

const auth: MiddlewareHandler = async (context, next) => {
  if (context.req.header('x-admin') !== 'true') {
    return context.json({ error: { message: 'Unauthorized' } }, 401)
  }

  await next()
}

describe('flueDashboard', () => {
  it('fails closed when no auth middleware is provided', () => {
    expect(() => flueDashboard({ runtime: fixtureRuntime })).toThrow(/requires an auth middleware/)
  })

  it('requires the configured auth middleware', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs')

    expect(response.status).toBe(401)
  })

  it('lists normalized runs through the dashboard API', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs', {
      headers: { 'x-admin': 'true' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.runs).toHaveLength(2)
    expect(body.runs[0]).toMatchObject({
      id: 'run-success-1',
      workflowName: 'daily-report',
    })
  })

  it('returns normalized run events', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs/run-success-1/events', {
      headers: { 'x-admin': 'true' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.events).toHaveLength(3)
    expect(body.summary.usage.totalTokens).toBe(140)
  })

  it('serves the dashboard shell in unsafe dev mode', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, unsafeDevMode: true })
    const response = await app.request('/')
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('Flue Dashboard')
  })
})
