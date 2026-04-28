export interface DebtDistributorSummary {
    membresia_id: number | null
    nombre: string | null
}

export interface DebtKitSummary {
    id: number | null
    nombre: string | null
    cantidad_recibida: number | null
}

export interface DebtCampaignSummary {
    id: number | null
    nombre: string | null
}

export interface DebtContractSummary {
    id: number | null
    numero: string | null
}

export interface DebtQuota {
    id: number
    numero_cuota: number
    monto_cuota: number
    estado: string
    fecha_vencimiento: string | null
    pagada_at: string | null
    transaccion: {
        id: number
        tipo: string
        monto: number
        created_at: string | null
    } | null
}

export interface DebtTransaction {
    id: number
    tipo: string
    monto: number
    descripcion: string | null
    created_at: string | null
}

export interface DebtListItem {
    id: number
    estado: string
    modelo_pago: string
    monto_total: number
    monto_pagado: number
    monto_pendiente: number
    fecha_vencimiento: string | null
    numero_cuotas: number | null
    cuotas_pendientes: number
    cuotas_vencidas: number
    proxima_cuota: DebtQuota | null
    distribuidor: DebtDistributorSummary
    kit: DebtKitSummary
    campana: DebtCampaignSummary
    contrato: DebtContractSummary
    confirmado_at: string | null
}

export interface DebtDetail extends DebtListItem {
    configuracion_pago_snapshot: Record<string, unknown>
    cuotas: DebtQuota[]
    transacciones: DebtTransaction[]
}

export interface DebtPaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface PaginatedPayload<T> {
    current_page: number
    data: T[]
    last_page: number
    per_page: number
    total: number
}
