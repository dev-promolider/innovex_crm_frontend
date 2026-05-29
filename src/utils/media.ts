import { API_BASE_URL } from '@/app/apiClient'

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

export function resolveMediaUrl(value: string | null | undefined): string | null {
    const normalizedValue = typeof value === 'string' ? value.trim() : ''

    if (!normalizedValue) {
        return null
    }

    if (isAbsoluteUrl(normalizedValue)) {
        return normalizedValue
    }

    if (normalizedValue.startsWith('/storage/')) {
        return `${API_ORIGIN}${normalizedValue}`
    }

    if (normalizedValue.startsWith('storage/')) {
        return `${API_ORIGIN}/${normalizedValue}`
    }

    if (normalizedValue.startsWith('/')) {
        return `${API_ORIGIN}${normalizedValue}`
    }

    return `${API_ORIGIN}/storage/${normalizedValue.replace(/^\/+/, '')}`
}