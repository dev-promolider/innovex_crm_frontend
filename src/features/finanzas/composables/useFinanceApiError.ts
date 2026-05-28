import axios from 'axios'

export const normalizeFinanceError = (error: unknown, fallback = 'No fue posible completar la operación financiera.'): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage
    }

    const validationErrors = error.response?.data?.errors
    if (validationErrors && typeof validationErrors === 'object') {
      const firstGroup = Object.values(validationErrors)[0]
      if (Array.isArray(firstGroup) && typeof firstGroup[0] === 'string') {
        return firstGroup[0]
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
