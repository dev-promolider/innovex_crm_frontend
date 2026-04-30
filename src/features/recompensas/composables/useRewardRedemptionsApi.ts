import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type { PaginatedPayload, RewardRedemption, RewardRedemptionFilters } from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
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

    return 'No fue posible completar la operacion sobre canjes.'
}

export function useRewardRedemptionsApi() {
    const { authHeaders } = useAuthenticatedSession()

    const redemptions = shallowRef<RewardRedemption[]>([])
    const isLoading = shallowRef(false)
    const isUpdating = shallowRef<number | null>(null)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')
    const pagination = shallowRef({
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 20,
    })

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchRedemptions = async (filters: RewardRedemptionFilters = {}) => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const searchParams = new URLSearchParams()
            searchParams.set('page', String(filters.page ?? 1))

            if (filters.estado) {
                searchParams.set('estado', filters.estado)
            }

            if (filters.search) {
                searchParams.set('search', filters.search)
            }

            const response = await apiClient.get<SuccessResponse<PaginatedPayload<RewardRedemption>>>(
                `/workspace/admin/recompensas/canjes?${searchParams.toString()}`,
                { headers: authHeaders() },
            )

            redemptions.value = response.data.data.data ?? []
            pagination.value = {
                total: response.data.data.total ?? redemptions.value.length,
                current_page: response.data.data.current_page ?? 1,
                last_page: response.data.data.last_page ?? 1,
                per_page: response.data.data.per_page ?? 20,
            }
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const fetchRedemption = async (id: number) => {
        const response = await apiClient.get<SuccessResponse<RewardRedemption>>(
            `/workspace/admin/recompensas/canjes/${id}`,
            { headers: authHeaders() },
        )

        return response.data.data
    }

    const deliverRedemption = async (id: number) => {
        isUpdating.value = id
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<RewardRedemption>>(
                `/workspace/admin/recompensas/canjes/${id}/entregar`,
                {},
                { headers: authHeaders() },
            )

            successMessage.value = response.data.message ?? 'Canje entregado.'
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isUpdating.value = null
        }
    }

    const cancelRedemption = async (id: number, motivo: string) => {
        isUpdating.value = id
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<RewardRedemption>>(
                `/workspace/admin/recompensas/canjes/${id}/cancelar`,
                { motivo },
                { headers: authHeaders() },
            )

            successMessage.value = response.data.message ?? 'Canje cancelado.'
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isUpdating.value = null
        }
    }

    return {
        redemptions: readonly(redemptions),
        isLoading: readonly(isLoading),
        isUpdating: readonly(isUpdating),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        pagination: readonly(pagination),
        clearMessages,
        fetchRedemptions,
        fetchRedemption,
        deliverRedemption,
        cancelRedemption,
    }
}