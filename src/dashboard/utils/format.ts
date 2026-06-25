export function formatDateTime(value: string | null): string {
  if (!value) return 'Not recorded'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value))
}

export function formatDuration(value: number | null): string {
  if (value == null) return 'Unknown'
  if (value < 1000) return `${value} ms`

  const seconds = value / 1000
  if (seconds < 60) return `${seconds.toFixed(1)} s`

  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return `${minutes} m ${remainder} s`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

export function formatCost(value: number | null): string {
  if (value == null) return 'Not available'

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(value)
}
