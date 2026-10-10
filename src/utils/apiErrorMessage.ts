import axios from 'axios'

const unavailableMessage = 'Esta sección todavía no está disponible'
const sessionExpiredMessage = 'Tu sesión expiró. Vuelve a iniciar sesión'
const forbiddenMessage = 'No tienes permiso para ver esta sección'
const retryMessage = 'No pudimos cargar la información. Inténtalo de nuevo'

interface ApiErrorMessageOptions {
  forbiddenMessage?: string
}

const firstFieldError = (errors: unknown): string | null => {
  if (!errors || typeof errors !== 'object') {
    return null
  }

  for (const messages of Object.values(errors)) {
    if (typeof messages === 'string' && messages.trim()) {
      return messages
    }

    if (Array.isArray(messages)) {
      const message = messages.find((item): item is string => typeof item === 'string' && item.trim().length > 0)
      if (message) {
        return message
      }
    }
  }

  return null
}

export const getApiErrorMessage = (error: unknown, options: ApiErrorMessageOptions = {}): string => {
  console.error('API request failed:', error)

  const response = axios.isAxiosError(error)
    ? error.response
    : error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { status?: number; data?: { errors?: unknown } } }).response
      : null
  const status = response?.status

  if (status === 404) {
    return unavailableMessage
  }

  if (status === 401) {
    return sessionExpiredMessage
  }

  if (status === 403) {
    return options.forbiddenMessage ?? forbiddenMessage
  }

  if (status === 422) {
    return firstFieldError(response?.data?.errors) ?? retryMessage
  }

  return retryMessage
}
