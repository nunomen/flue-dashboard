const API_BASE = import.meta.env.VITE_FLUE_DASHBOARD_API_BASE ?? ''

export interface ApiErrorResponse {
  error?: {
    message?: string
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const requestInit: RequestInit = {
    headers: {
      accept: 'application/json',
    },
  }

  if (signal) {
    requestInit.signal = signal
  }

  const response = await fetch(`${API_BASE}${path}`, requestInit)

  if (!response.ok) {
    let message = `Request failed with ${response.status}`

    try {
      const body = await response.json() as ApiErrorResponse
      message = body.error?.message ?? message
    } catch {
      // Keep the status-derived message when the response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}
