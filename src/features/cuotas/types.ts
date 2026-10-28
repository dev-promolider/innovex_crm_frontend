export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida' | 'parcial'
export type MedioPago = 'transferencia' | 'pago_movil' | 'efectivo' | 'otro'

export const estadosCuota: { value: EstadoCuota; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'parcial', label: 'Parcial' },
]

export const mediosPago: { value: MedioPago; label: string }[] = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'pago_movil', label: 'Pago móvil' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'otro', label: 'Otro' },
]

export interface CuotaBase {
  id: number
  numero: number
  total_cuotas: number
  monto: number
  monto_pagado: number
  saldo: number
  moneda: string
  fecha_vencimiento: string
  dias_restantes: number
  estado: EstadoCuota
  pagado_en: string | null
}

export interface MiCuota extends CuotaBase {
  solicitud_kit_id: number | null
  kit: { id: number; nombre: string } | null
}

export interface CuotaAdmin extends CuotaBase {
  distribuidor: { id: number; nombre: string } | null
  empresa: { id: number; nombre: string } | null
}

export interface ProximaCuota {
  id: number
  monto: number
  fecha_vencimiento: string
  dias_restantes: number
}

export interface MisCuotasResumen {
  total_pendiente: number
  total_vencido: number
  proxima_cuota: ProximaCuota | null
  moneda: string
}

export interface CuotasTotales {
  monto: number
  pagado: number
  pendiente: number
  vencido: number
  moneda: string
}

export interface CuotasPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PagoCuotaPayload {
  monto: number
  medio_pago: MedioPago
  referencia: string
  pagado_en?: string
  notas?: string
}

export interface PagoCuotaResult {
  pago: { id: number; monto: number; medio_pago: MedioPago; referencia: string; pagado_en: string }
  cuota: { id: number; estado: EstadoCuota; monto_pagado: number; saldo: number; pagado_en: string | null }
  puntos_ganados: number
}
