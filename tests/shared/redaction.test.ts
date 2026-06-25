import { describe, expect, it } from 'vitest'

import { createPayloadPreview, redactValue } from '../../src/shared'

describe('redaction helpers', () => {
  it('redacts sensitive payload keys without removing safe metadata', () => {
    const redacted = redactValue({
      accountId: 'acct_123',
      prompt: 'secret prompt',
      nested: {
        token: 'secret token',
        status: 'ok',
      },
    })

    expect(redacted).toEqual({
      accountId: 'acct_123',
      prompt: '[redacted]',
      nested: {
        token: '[redacted]',
        status: 'ok',
      },
    })
  })

  it('marks previews when object fields are redacted', () => {
    const preview = createPayloadPreview({
      workflowInput: { query: 'private' },
      runId: 'run-1',
    })

    expect(preview.kind).toBe('object')
    expect(preview.redacted).toBe(true)
    expect(preview.entries).toMatchObject({
      workflowInput: '[redacted]',
      runId: 'run-1',
    })
  })
})
