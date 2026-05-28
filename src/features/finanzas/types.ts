import type { DebtPaginationMeta, PaginatedPayload } from '@/features/deudas/types'

export type { PaginatedPayload, DebtPaginationMeta }

export interface FinanceUserSummary {
  id: number
  nombre: string | null
  apellido: string | null
}

export interface FinanceMembershipSummary {
  id: number
  usuario: FinanceUserSummary | null
}

export interface AjusteFinanciero {
  id: number
  empresa_id: number
  membresia_id: number
  tipo: 'credito' | 'debito'
  monto: number
  descripcion: string
  estado: 'pendiente_aprobacion' | 'aprobado' | 'rechazado'
  solicitado_por_id: number
  aprobado_por_id: number | null
  rechazado_por_id: number | null
  motivo_rechazo: string | null
  transaccion_id: number | null
  aprobado_at: string | null
  rechazado_at: string | null
  created_at: string | null
  membresia?: FinanceMembershipSummary | null
  solicitado_por?: FinanceUserSummary | null
}

export interface RetencionComision {
  id: number
  empresa_id: number
  membresia_id: number
  porcentaje_retenido: number
  monto_retenido: number
  justificacion: string
  estado: 'activa' | 'liberada' | 'cancelada'
  origen: 'manual' | 'automatica'
  regla_clave: string | null
  aplicado_por_id: number
  transaccion_retencion_id: number | null
  liberado_por_id: number | null
  liberado_at: string | null
  motivo_liberacion: string | null
  transaccion_liberacion_id: number | null
  created_at: string | null
  membresia?: FinanceMembershipSummary | null
}
