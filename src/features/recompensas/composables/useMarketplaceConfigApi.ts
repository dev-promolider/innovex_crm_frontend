import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'

export interface MarketplacePointsConfig {
    puntos_por_unidad_moneda_venta: number
    puntos_pago_puntual: number
    puntos_crecimiento_equipo: number
    persisted: boolean
}

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

export function useMarketplaceConfigApi() {
    const { authHeaders } = useAuthenticatedSession()

    const config = shallowRef<MarketplacePointsConfig | null>(null)
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const fetchConfig = async () => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<MarketplacePointsConfig>>(
                '/workspace/admin/recompensas/configuracion-puntos',
                { headers: authHeaders() },
            )
            config.value = response.data.data
        } catch (error) {
            config.value = null
            errorMessage.value = getApiErrorMessage(error)
        } finally {
            isLoading.value = false
        }
    }

    const saveConfig = async (payload: Omit<MarketplacePointsConfig, 'persisted'>) => {
        isSaving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        try {
            const response = await apiClient.put<SuccessResponse<MarketplacePointsConfig>>(
                '/workspace/admin/recompensas/configuracion-puntos',
                payload,
                { headers: authHeaders() },
            )
            config.value = response.data.data
            successMessage.value = response.data.message ?? 'Configuracion guardada.'
        } catch (error) {
            errorMessage.value = getApiErrorMessage(error)
        } finally {
            isSaving.value = false
        }
    }

    return {
        config: readonly(config),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        fetchConfig,
        saveConfig,
    }
}
