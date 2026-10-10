import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import type {
    PaginatedPayload,
    ScoringConfiguration,
    ScoringEvaluation,
    ScoringHistoryEntry,
    ScoringRole,
    UpdateScoringConfigurationPayload,
} from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

export function useScoringAdminApi() {
    const { authHeaders } = useAuthenticatedSession()

    const configurations = shallowRef<Record<ScoringRole, ScoringConfiguration> | null>(null)
    const history = shallowRef<ScoringHistoryEntry[]>([])
    const evaluations = shallowRef<ScoringEvaluation[]>([])
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchConfigurations = async () => {
        const response = await apiClient.get<SuccessResponse<Record<ScoringRole, ScoringConfiguration>>>(
            '/workspace/admin/scoring/configuracion',
            { headers: authHeaders() },
        )

        configurations.value = response.data.data
        return response.data.data
    }

    const fetchHistory = async () => {
        const response = await apiClient.get<SuccessResponse<PaginatedPayload<ScoringHistoryEntry>>>(
            '/workspace/admin/scoring/historial?per_page=8',
            { headers: authHeaders() },
        )

        history.value = response.data.data.data ?? []
        return history.value
    }

    const fetchEvaluations = async () => {
        const response = await apiClient.get<SuccessResponse<PaginatedPayload<ScoringEvaluation>>>(
            '/workspace/admin/scoring/evaluaciones?per_page=8',
            { headers: authHeaders() },
        )

        evaluations.value = response.data.data.data ?? []
        return evaluations.value
    }

    const loadAll = async () => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            await Promise.all([fetchConfigurations(), fetchHistory(), fetchEvaluations()])
        } catch (error) {
            configurations.value = null
            history.value = []
            evaluations.value = []
            errorMessage.value = getApiErrorMessage(error)
        } finally {
            isLoading.value = false
        }
    }

    const updateConfiguration = async (role: ScoringRole, payload: UpdateScoringConfigurationPayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.put<SuccessResponse<ScoringConfiguration>>(
                `/workspace/admin/scoring/configuracion/${role}`,
                payload,
                { headers: authHeaders() },
            )

            successMessage.value = response.data.message ?? 'Configuracion de scoring actualizada.'
            await loadAll()

            return response.data.data
        } catch (error) {
            errorMessage.value = getApiErrorMessage(error)
        } finally {
            isSaving.value = false
        }
    }

    return {
        configurations: readonly(configurations),
        history: readonly(history),
        evaluations: readonly(evaluations),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        clearMessages,
        loadAll,
        updateConfiguration,
    }
}