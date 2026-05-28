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

  return 'No fue posible completar la operacion.'
}

export function useProfileApi() {
  const { platformHeaders } = useAuthenticatedSession()

  const profile = shallowRef<UserProfile | null>(null)
  const isLoading = shallowRef(false)
  const isSavingProfile = shallowRef(false)
  const isSavingPassword = shallowRef(false)
  const profileErrorMessage = shallowRef('')
  const profileSuccessMessage = shallowRef('')
  const passwordErrorMessage = shallowRef('')
  const passwordSuccessMessage = shallowRef('')

  const clearProfileMessages = () => {
    profileErrorMessage.value = ''
    profileSuccessMessage.value = ''
  }

  const clearPasswordMessages = () => {
    passwordErrorMessage.value = ''
    passwordSuccessMessage.value = ''
  }

  const fetchProfile = async () => {
    isLoading.value = true
    profileErrorMessage.value = ''

    try {
      const response = await apiClient.get<SuccessResponse<UserProfile>>('/auth/perfil', {
        headers: platformHeaders(),
      })

      profile.value = response.data.data
      return response.data.data
    } catch (error) {
      profileErrorMessage.value = normalizeErrorMessage(error)
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

      passwordSuccessMessage.value = response.data.message ?? 'Contrasena actualizada correctamente.'
    } catch (error) {
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
    passwordErrorMessage,
    passwordSuccessMessage,
    clearProfileMessages,
    clearPasswordMessages,
    fetchProfile,
    updateProfile,
    updatePassword,
  }
}
