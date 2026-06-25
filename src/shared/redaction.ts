import type { PayloadPreview } from './types'

const SENSITIVE_KEYS = new Set([
  'apiKey',
  'api_key',
  'arguments',
  'authorization',
  'content',
  'input',
  'messages',
  'password',
  'prompt',
  'prompts',
  'result',
  'secret',
  'systemPrompt',
  'token',
  'toolArguments',
  'toolResult',
  'workflowInput',
  'workflowResult',
])

const DEFAULT_MAX_DEPTH = 3
const DEFAULT_MAX_KEYS = 20
const REDACTED = '[redacted]'
const TRUNCATED = '[truncated]'

export interface RedactionOptions {
  maxDepth?: number
  maxKeys?: number
}

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key) || /secret|token|password|credential|authorization/i.test(key)
}

export function redactValue(value: unknown, options: RedactionOptions = {}): Record<string, unknown> | unknown[] | unknown {
  return redactNode(value, {
    maxDepth: options.maxDepth ?? DEFAULT_MAX_DEPTH,
    maxKeys: options.maxKeys ?? DEFAULT_MAX_KEYS,
    depth: 0,
  })
}

export function createPayloadPreview(value: unknown, options: RedactionOptions = {}): PayloadPreview {
  if (value == null) {
    return {
      kind: 'empty',
      label: 'No payload',
      redacted: false,
      truncated: false,
    }
  }

  if (typeof value !== 'object') {
    return {
      kind: 'primitive',
      label: formatPrimitive(value),
      redacted: false,
      truncated: false,
      value,
    }
  }

  if (Array.isArray(value)) {
    const maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS

    return {
      kind: 'array',
      label: `${value.length} item${value.length === 1 ? '' : 's'}`,
      redacted: false,
      truncated: value.length > maxKeys,
      value: value.slice(0, maxKeys).map((item) => redactValue(item, options)),
    }
  }

  const entries = Object.entries(value as Record<string, unknown>)
  const maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS
  const redacted = Object.fromEntries(
    entries
      .slice(0, maxKeys)
      .map(([key, entryValue]) => [key, isSensitiveKey(key) ? REDACTED : redactValue(entryValue, options)]),
  )

  return {
    kind: 'object',
    label: `${entries.length} field${entries.length === 1 ? '' : 's'}`,
    redacted: entries.some(([key]) => isSensitiveKey(key)),
    truncated: entries.length > maxKeys,
    entries: redacted,
  }
}

function redactNode(value: unknown, state: { maxDepth: number, maxKeys: number, depth: number }): unknown {
  if (value == null || typeof value !== 'object') {
    return value
  }

  if (state.depth >= state.maxDepth) {
    return TRUNCATED
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, state.maxKeys)
      .map((item) => redactNode(item, { ...state, depth: state.depth + 1 }))
  }

  const output: Record<string, unknown> = {}
  const entries = Object.entries(value as Record<string, unknown>)

  for (const [key, entryValue] of entries.slice(0, state.maxKeys)) {
    output[key] = isSensitiveKey(key)
      ? REDACTED
      : redactNode(entryValue, { ...state, depth: state.depth + 1 })
  }

  if (entries.length > state.maxKeys) {
    output.__truncated = entries.length - state.maxKeys
  }

  return output
}

function formatPrimitive(value: unknown): string {
  if (typeof value === 'string') {
    return value.length > 120 ? `${value.slice(0, 120)}...` : value
  }

  return String(value)
}
