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
    asiento_contable_id: number | null
    transaccion_reversa_de: number | null
    es_reversible: boolean
    created_at: string | null
}

export interface LedgerDistributorSummary {
    id: number
    nombre: string
    estado: string | null
}

export interface LedgerDebtSnapshot {
    id: number
    estado: string
    monto_total: number
    monto_pagado: number
    monto_pendiente: number
    fecha_vencimiento: string | null
}

export interface LedgerMovement {
    id: number
    tipo: string
    monto: number
    saldo_disponible_anterior: number
    saldo_disponible_posterior: number
    referencia_id: number | null
    referencia_tipo: string | null
    asiento_contable_id: number | null
    transaccion_reversa_de: number | null
    es_reversible: boolean
    descripcion: string | null
    created_at: string | null
}

export interface LedgerAccountStatement {
    distribuidor: LedgerDistributorSummary
    resumen: {
        saldo_disponible_actual: number
        deuda_pendiente_actual: number
        total_comisiones_liberadas: number
        total_retiros: number
        total_pagos_deuda: number
    }
    deuda_activa: LedgerDebtSnapshot | null
    movimientos: LedgerMovement[]
}

export interface DebtListItem {
    id: number
    estado: string
    estado_pre_disputa: string | null
    disputa: {
        motivo: string | null
        resolucion: string | null
        abierta_por_id: number | null
        resuelta_por_id: number | null
        abierta_at: string | null
        resuelta_at: string | null
    } | null
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
