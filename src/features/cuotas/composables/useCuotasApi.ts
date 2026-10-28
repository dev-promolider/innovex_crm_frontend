import { reactive, ref, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import type {
  CuotaAdmin,
  CuotasPaginationMeta,
  CuotasTotales,
  EstadoCuota,
  MiCuota,
  MisCuotasResumen,
  PagoCuotaPayload,
  PagoCuotaResult,
} from '../types'

interface MisCuotasPayload {
  data: MiCuota[]
  resumen: MisCuotasResumen
  meta: CuotasPaginationMeta
}

interface CuotasAdminPayload {
  data: CuotaAdmin[]
  totales: CuotasTotales
  meta: CuotasPaginationMeta
}

export interface CuotasAdminFilters {
  search: string
  estado: EstadoCuota | ''
  distribuidor_id: number | null
  desde: string
  hasta: string
}

const defaultPagination = (): CuotasPaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

export function useCuotasApi() {
  const { authHeaders } = useAuthenticatedSession()

  const misCuotas = ref<MiCuota[]>([])
  const resumen = shallowRef<MisCuotasResumen | null>(null)
  const misCuotasFilterEstado = shallowRef<EstadoCuota | ''>('')
  const misCuotasPagination = reactive<CuotasPaginationMeta>(defaultPagination())
  const isLoadingMisCuotas = shallowRef(false)
  const misCuotasError = shallowRef('')

  const cuotas = ref<CuotaAdmin[]>([])
  const totales = shallowRef<CuotasTotales | null>(null)
  const cuotasPagination = reactive<CuotasPaginationMeta>(defaultPagination())
  const filters = reactive<CuotasAdminFilters>({
    search: '',
    estado: '',
    distribuidor_id: null,
    desde: '',
    hasta: '',
  })
  const isLoadingCuotas = shallowRef(false)
  const cuotasError = shallowRef('')

  const isPaying = shallowRef(false)
  const pagoError = shallowRef('')

  const fetchMisCuotas = async (page = 1) => {
    isLoadingMisCuotas.value = true
    misCuotasError.value = ''

    try {
      const { data } = await apiClient.get<MisCuotasPayload>('/mis-cuotas', {
        headers: authHeaders(),
        params: { estado: misCuotasFilterEstado.value || undefined, page },
      })
      misCuotas.value = data.data
      resumen.value = data.resumen
      Object.assign(misCuotasPagination, data.meta)
    } catch (error) {
      misCuotasError.value = getApiErrorMessage(error, {
        forbiddenMessage: 'Esta sección solo está disponible para distribuidores activos.',
      })
      misCuotas.value = []
      resumen.value = null
      Object.assign(misCuotasPagination, defaultPagination())
    } finally {
      isLoadingMisCuotas.value = false
    }
  }

  const fetchCuotas = async (page = 1) => {
    isLoadingCuotas.value = true
    cuotasError.value = ''

    try {
      const { data } = await apiClient.get<CuotasAdminPayload>('/cuotas', {
        headers: authHeaders(),
        params: {
          search: filters.search.trim() || undefined,
          estado: filters.estado || undefined,
          distribuidor_id: filters.distribuidor_id ?? undefined,
          desde: filters.desde || undefined,
          hasta: filters.hasta || undefined,
          page,
        },
      })
      cuotas.value = data.data
      totales.value = data.totales
      Object.assign(cuotasPagination, data.meta)
    } catch (error) {
      cuotasError.value = getApiErrorMessage(error)
      cuotas.value = []
      totales.value = null
      Object.assign(cuotasPagination, defaultPagination())
    } finally {
      isLoadingCuotas.value = false
    }
  }

  const registrarPago = async (cuotaId: number, payload: PagoCuotaPayload): Promise<PagoCuotaResult | null> => {
    isPaying.value = true
    pagoError.value = ''

    try {
      const { data } = await apiClient.post<{ data: PagoCuotaResult }>(
        `/cuotas/${cuotaId}/pagos`,
        payload,
        { headers: authHeaders() },
      )
      return data.data
    } catch (error) {
      pagoError.value = getApiErrorMessage(error, {
        forbiddenMessage: 'No tienes permiso para registrar este pago.',
      })
      return null
    } finally {
      isPaying.value = false
    }
  }

  return {
    misCuotas,
    resumen,
    misCuotasFilterEstado,
    misCuotasPagination,
    isLoadingMisCuotas,
    misCuotasError,
    cuotas,
    totales,
    cuotasPagination,
    filters,
    isLoadingCuotas,
    cuotasError,
    isPaying,
    pagoError,
    fetchMisCuotas,
    fetchCuotas,
    registrarPago,
  }
}
