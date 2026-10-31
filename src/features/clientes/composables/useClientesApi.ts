import { reactive, ref, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import type {
  ClienteDetail,
  ClienteListItem,
  ClientesPaginationMeta,
  EstadoPedido,
  MiCredito,
} from '../types'

interface ApiResponse<T> {
  data: T
}

interface ClienteListPayload {
  data: ClienteListItem[]
  meta: ClientesPaginationMeta
}

interface DistributorApiItem {
  id: number
  nombre?: string
  usuario?: {
    nombre?: string | null
    apellido?: string | null
  } | null
}

interface DistributorListPayload {
  data: DistributorApiItem[]
}

export interface ClientesFilters {
  search: string
  estado: EstadoPedido | ''
  desde: string
  hasta: string
  distribuidor_id: number | null
}

const defaultPagination = (): ClientesPaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

export function useClientesApi() {
  const { authHeaders } = useAuthenticatedSession()
  const clientes = ref<ClienteListItem[]>([])
  const detalle = shallowRef<ClienteDetail | null>(null)
  const distribuidores = ref<{ id: number; nombre: string }[]>([])
  const credito = shallowRef<MiCredito | null>(null)
  const isLoading = shallowRef(false)
  const isDetailLoading = shallowRef(false)
  const isDistributorsLoading = shallowRef(false)
  const isCreditLoading = shallowRef(false)
  const isExporting = shallowRef(false)
  const errorMessage = shallowRef('')
  const exportErrorMessage = shallowRef('')
  const detailError = shallowRef('')
  const distributorsError = shallowRef('')
  const creditError = shallowRef('')
  const pagination = reactive<ClientesPaginationMeta>(defaultPagination())
  const filters = reactive<ClientesFilters>({
    search: '',
    estado: '',
    desde: '',
    hasta: '',
    distribuidor_id: null,
  })

  const fetchClientes = async (page = 1) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const { data } = await apiClient.get<ClienteListPayload>('/clientes', {
        headers: authHeaders(),
        params: {
          search: filters.search.trim() || undefined,
          estado: filters.estado || undefined,
          desde: filters.desde || undefined,
          hasta: filters.hasta || undefined,
          distribuidor_id: filters.distribuidor_id ?? undefined,
          page,
        },
      })

      clientes.value = data.data
      Object.assign(pagination, data.meta)
    } catch (error) {
      errorMessage.value = getApiErrorMessage(error)
      clientes.value = []
      Object.assign(pagination, defaultPagination())
    } finally {
      isLoading.value = false
    }
  }

  const fetchDetalle = async (clienteId: number) => {
    isDetailLoading.value = true
    detailError.value = ''
    detalle.value = null

    try {
      const { data } = await apiClient.get<ApiResponse<ClienteDetail>>(
        `/clientes/${clienteId}`,
        { headers: authHeaders() },
      )
      detalle.value = data.data
    } catch (error) {
      detailError.value = getApiErrorMessage(error)
    } finally {
      isDetailLoading.value = false
    }
  }

  const fetchDistribuidores = async () => {
    isDistributorsLoading.value = true
    distributorsError.value = ''

    try {
      const { data } = await apiClient.get<ApiResponse<DistributorListPayload>>(
        '/workspace/admin/distribuidores',
        {
          headers: authHeaders(),
          params: { page: 1, per_page: 100 },
        },
      )
      distribuidores.value = data.data.data.map((item) => ({
        id: item.id,
        nombre: item.nombre?.trim()
          || `${item.usuario?.nombre ?? ''} ${item.usuario?.apellido ?? ''}`.trim()
          || `Distribuidor ${item.id}`,
      }))
    } catch (error) {
      distributorsError.value = getApiErrorMessage(error)
      distribuidores.value = []
    } finally {
      isDistributorsLoading.value = false
    }
  }

  const fetchCredito = async () => {
    isCreditLoading.value = true
    creditError.value = ''

    try {
      const { data } = await apiClient.get<ApiResponse<MiCredito>>(
        '/workspace/mobile/mi-credito',
        { headers: authHeaders() },
      )
      credito.value = data.data
    } catch (error) {
      creditError.value = getApiErrorMessage(error, {
        forbiddenMessage: 'Disponible solo para distribuidores',
        unavailableMessage: 'Disponible solo para distribuidores',
      })
      credito.value = null
    } finally {
      isCreditLoading.value = false
    }
  }

  const exportarClientes = async () => {
    isExporting.value = true
    exportErrorMessage.value = ''

    try {
      const response = await apiClient.get<Blob>('/clientes/exportar', {
        headers: authHeaders(),
        responseType: 'blob',
        params: {
          search: filters.search.trim() || undefined,
          estado: filters.estado || undefined,
          desde: filters.desde || undefined,
          hasta: filters.hasta || undefined,
          distribuidor_id: filters.distribuidor_id ?? undefined,
        },
      })
      const blobUrl = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'clientes.csv'
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 0)
    } catch (error) {
      exportErrorMessage.value = getApiErrorMessage(error)
    } finally {
      isExporting.value = false
    }
  }

  return {
    clientes,
    detalle,
    distribuidores,
    credito,
    isLoading,
    isDetailLoading,
    isDistributorsLoading,
    isCreditLoading,
    isExporting,
    errorMessage,
    exportErrorMessage,
    detailError,
    distributorsError,
    creditError,
    pagination,
    filters,
    fetchClientes,
    fetchDetalle,
    fetchDistribuidores,
    fetchCredito,
    exportarClientes,
  }
}
