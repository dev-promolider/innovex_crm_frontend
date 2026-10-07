import axios from 'axios'
import { shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { updateAuthenticatedUserProfile, useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type { UpdateUserPasswordPayload, UpdateUserProfilePayload, UserProfile } from '../types'

interface SuccessResponse<T> {
  status: string
  message?: string
  data: T
}

interface EmptySuccessResponse {
  status: string
  message?: string
}

const normalizeErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response?.status === 422) return ''
  return 'No pudimos completar la solicitud. Inténtalo nuevamente.'
}

const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return {}

  const validationErrors = error.response.data?.errors
  if (!validationErrors || typeof validationErrors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(validationErrors).flatMap(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : undefined
      return typeof message === 'string' ? [[field, message]] : []
    }),
  )
}

export function useProfileApi() {
  const { platformHeaders } = useAuthenticatedSession()

  const profile = shallowRef<UserProfile | null>(null)
  const isLoading = shallowRef(false)
  const isSavingProfile = shallowRef(false)
  const isSavingPassword = shallowRef(false)
  const profileErrorMessage = shallowRef('')
  const profileSuccessMessage = shallowRef('')
  const profileFieldErrors = shallowRef<Record<string, string>>({})
  const passwordErrorMessage = shallowRef('')
  const passwordSuccessMessage = shallowRef('')
  const passwordFieldErrors = shallowRef<Record<string, string>>({})

  const clearProfileMessages = () => {
    profileErrorMessage.value = ''
    profileSuccessMessage.value = ''
    profileFieldErrors.value = {}
  }

  const clearPasswordMessages = () => {
    passwordErrorMessage.value = ''
    passwordSuccessMessage.value = ''
    passwordFieldErrors.value = {}
  }

  const fetchProfile = async () => {
    isLoading.value = true
    profileErrorMessage.value = ''
    profileFieldErrors.value = {}

    try {
      const response = await apiClient.get<SuccessResponse<UserProfile>>('/auth/perfil', {
        headers: platformHeaders(),
      })

      profile.value = response.data.data
      return response.data.data
    } catch (error) {
      profileErrorMessage.value = 'No pudimos cargar tu perfil'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (payload: UpdateUserProfilePayload) => {
    isSavingProfile.value = true
    clearProfileMessages()

    try {
      const response = await apiClient.put<SuccessResponse<UserProfile>>('/auth/perfil', payload, {
        headers: platformHeaders(),
      })

      profile.value = response.data.data
      profileSuccessMessage.value = response.data.message ?? 'Perfil actualizado correctamente.'
      updateAuthenticatedUserProfile({
        nombre: response.data.data.nombre,
        email: response.data.data.email,
      })

      return response.data.data
    } catch (error) {
      profileFieldErrors.value = extractFieldErrors(error)
      profileErrorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      isSavingProfile.value = false
    }
  }

  const updatePassword = async (payload: UpdateUserPasswordPayload) => {
    isSavingPassword.value = true
    clearPasswordMessages()

    try {
      const response = await apiClient.put<EmptySuccessResponse>('/auth/password', payload, {
        headers: platformHeaders(),
      })

      passwordSuccessMessage.value = response.data.message ?? 'Contraseña actualizada correctamente.'
    } catch (error) {
      passwordFieldErrors.value = extractFieldErrors(error)
      passwordErrorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      isSavingPassword.value = false
    }
  }

  return {
    profile,
    isLoading,
    isSavingProfile,
    isSavingPassword,
    profileErrorMessage,
    profileSuccessMessage,
    profileFieldErrors,
    passwordErrorMessage,
    passwordSuccessMessage,
    passwordFieldErrors,
    clearProfileMessages,
    clearPasswordMessages,
    fetchProfile,
    updateProfile,
    updatePassword,
  }
}
