import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import type { PaginatedPayload, RewardRedemption, RewardRedemptionFilters } from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

export function useRewardRedemptionsApi() {
    const { authHeaders } = useAuthenticatedSession()

    const redemptions = shallowRef<RewardRedemption[]>([])
    const isLoading = shallowRef(false)
    const isUpdating = shallowRef<number | null>(null)
    const errorMessage = shallowRef('')
    const detailErrorMessage = shallowRef('')
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
        detailErrorMessage.value = ''

        try {
            const searchParams = new URLSearchParams()
            searchParams.set('page', String(filters.page ?? 1))

            if (filters.estado) {
                searchParams.set('estado', filters.estado)
            }

            if (filters.search) {
                searchParams.set('search', filters.search)
            }

            if (filters.membresia_id) {
                searchParams.set('membresia_id', String(filters.membresia_id))
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
            redemptions.value = []
            pagination.value = { total: 0, current_page: 1, last_page: 1, per_page: 20 }
            errorMessage.value = getApiErrorMessage(error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchRedemption = async (id: number) => {
        detailErrorMessage.value = ''
        try {
            const response = await apiClient.get<SuccessResponse<RewardRedemption>>(
                `/workspace/admin/recompensas/canjes/${id}`,
                { headers: authHeaders() },
            )
            return response.data.data
        } catch (error) {
            detailErrorMessage.value = getApiErrorMessage(error)
            return null
        }
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
            errorMessage.value = getApiErrorMessage(error)
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
            errorMessage.value = getApiErrorMessage(error)
        } finally {
            isUpdating.value = null
        }
    }

    return {
        redemptions: readonly(redemptions),
        isLoading: readonly(isLoading),
        isUpdating: readonly(isUpdating),
        errorMessage: readonly(errorMessage),
        detailErrorMessage: readonly(detailErrorMessage),
        successMessage: readonly(successMessage),
        pagination: readonly(pagination),
        clearMessages,
        fetchRedemptions,
        fetchRedemption,
        deliverRedemption,
        cancelRedemption,
    }
}