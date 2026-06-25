export interface DashboardRuntimeSource {
  listRuns: () => Promise<unknown>
  getRun: (runId: string) => Promise<unknown>
  listRunEvents?: (runId: string, options?: DashboardRunEventReadOptions) => Promise<unknown>
  streamRunEvents?: (runId: string) => Promise<Response | ReadableStream<Uint8Array> | null> | Response | ReadableStream<Uint8Array> | null
}

export interface DashboardRunEventReadOptions {
  limit?: number
  tail?: boolean
}

export function extractCollection(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value

  if (value != null && typeof value === 'object') {
    const record = value as Record<string, unknown>

    for (const key of keys) {
      const candidate = record[key]
      if (Array.isArray(candidate)) {
        return candidate
      }
    }
  }

  return []
}
