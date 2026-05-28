import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'

export interface AnalyticsFilters {
  desde?: string
  hasta?: string
}

export interface AnalyticsSummary {
  periodo: { desde: string; hasta: string }
  ventas: {
    aprobadas_cantidad: number
    aprobadas_monto: number
    pendientes_cantidad: number
    pendientes_monto: number
    rechazadas_cantidad: number
    rechazadas_monto: number
  }
  finanzas: { deuda_activa_monto: number }
  distribuidores: { activos: number }
  marketplace: { canjes_cantidad: number; puntos_utilizados: number }
}

export interface SalesByCampaign {
  campana_id: number | null
  campana_nombre: string
  ventas: number
  monto: number
  ticket_promedio: number
}

export interface SalesByPeriod {
  periodo: string
  ventas: number
  monto: number
}

export interface DistributorRankingItem {
  membresia_id: number
  nombre: string
  rango: string | null
  nivel_confianza: number | null
  ventas: number
  monto: number
}

export interface LeaderNetworkHealth {
  membresia_id: number
  nombre: string
  rango: string | null
  nivel_confianza: number | null
  tamano_equipo_directo: number
  valor_salud_red: number | null
  score_final_calculado: number | null
  evaluado_at: string | null
}

interface SuccessResponse<T> {
  status: string
  data: T
}

export function useAnalyticsApi() {
  const { authHeaders } = useAuthenticatedSession()

  const get = async <T>(path: string, params: object = {}) => {
    const response = await apiClient.get<SuccessResponse<T>>(path, {
      headers: authHeaders(),
      params,
    })

    return response.data.data
  }

  const fetchSummary = (filters: AnalyticsFilters = {}) =>
    get<AnalyticsSummary>('/workspace/admin/analytics/resumen', filters)

  const fetchSalesByCampaign = (filters: AnalyticsFilters = {}) =>
    get<SalesByCampaign[]>('/workspace/admin/analytics/ventas-por-campana', filters)

  const fetchSalesByPeriod = (filters: AnalyticsFilters & { granularidad?: 'day' | 'week' } = {}) =>
    get<SalesByPeriod[]>('/workspace/admin/analytics/ventas-por-periodo', filters)

  const fetchDistributorRanking = (filters: AnalyticsFilters & { patrocinador_id?: number; limit?: number } = {}) =>
    get<DistributorRankingItem[]>('/workspace/admin/analytics/distribuidores', filters)

  const fetchLeaderNetworkHealth = (filters: AnalyticsFilters = {}) =>
    get<LeaderNetworkHealth[]>('/workspace/admin/analytics/salud-red-lideres', filters)

  return {
    fetchSummary,
    fetchSalesByCampaign,
    fetchSalesByPeriod,
    fetchDistributorRanking,
    fetchLeaderNetworkHealth,
  }
}
