import { i18n } from '@/i18n'

type DateInput = string | number | Date | null | undefined

const fallbackLabel = '—'

const resolveDate = (value: DateInput) => {
  if (value == null || value === '') {
    return null
  }

  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const currentLocale = () => i18n.global.locale.value

export const formatDate = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  fallback = fallbackLabel,
) => {
  const parsed = resolveDate(value)
  if (!parsed) {
    return fallback
  }

  return new Intl.DateTimeFormat(currentLocale(), options).format(parsed)
}

export const formatDateTime = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
  fallback = fallbackLabel,
) => {
  const parsed = resolveDate(value)
  if (!parsed) {
    return fallback
  }

  return new Intl.DateTimeFormat(currentLocale(), options).format(parsed)
}

export const formatNumber = (
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {},
  fallback = fallbackLabel,
) => {
  if (value == null || value === '') {
    return fallback
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return new Intl.NumberFormat(currentLocale(), options).format(parsed)
}

export const formatCurrency = (
  value: number | string | null | undefined,
  currency = 'USD',
  fallback = fallbackLabel,
) => {
  if (value == null || value === '') {
    return fallback
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return new Intl.NumberFormat(currentLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed)
}
