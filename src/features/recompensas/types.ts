export type RewardRedemptionStatus = 'procesando' | 'entregado' | 'cancelado'
export type ScoringRole = 'vendedor_base' | 'lider_red'

export interface RewardRedemption {
    id: number
    estado: RewardRedemptionStatus
    puntos_utilizados: number
    entregado_at: string | null
    cancelado_at: string | null
    motivo_cancelacion: string | null
    created_at: string | null
    recompensa: {
        id: number
        nombre: string
        tipo_premio: string
        costo_puntos: number
        stock_disponible: number | null
    } | null
    distribuidor: {
        id: number
        nombre: string
        email: string | null
        telefono: string | null
        rango: string | null
        nivel_confianza: number | null
        puntos_marketplace: number | null
    } | null
    transaccion: {
        id: number
        tipo: string
        monto: number
        descripcion: string | null
        created_at: string | null
    } | null
    empresa_id?: number
    transaccion_id?: number | null
}

export interface ScoringConfiguration {
    id?: number
    rol_evaluado: ScoringRole
    peso_eficiencia: number
    peso_consistencia: number
    peso_volumen_ventas: number
    peso_pago_puntual: number
    peso_salud_red: number
    umbral_nivel_nuevo: number
    umbral_nivel_confiable: number
    umbral_nivel_verificado: number
    umbral_nivel_elite: number
    suma_pesos: number
    pesos_validos: boolean
    vigente_desde: string | null
    persisted: boolean
}

export interface ScoringHistoryEntry {
    id: number
    rol_evaluado: ScoringRole
    motivo_cambio: string | null
    vigente_desde: string | null
    vigente_hasta: string | null
    created_at: string | null
    cambiado_por: string | null
    snapshot: Record<string, unknown> | null
}

export interface ScoringEvaluation {
    id: number
    rol_evaluado: ScoringRole | null
    score_final_calculado: number
    nivel_confianza_anterior: number
    nivel_confianza_resultante: number
    delta: number
    ventas_periodo: number
    infracciones_periodo: number
    periodo_desde: string | null
    periodo_hasta: string | null
    created_at: string | null
    distribuidor: {
        id: number
        nombre: string
        rango: string | null
        nivel_confianza: number | null
    } | null
    ejecutado_por: string | null
}

export interface RewardRedemptionFilters {
    page?: number
    estado?: string
    search?: string
}

export interface PaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface PaginatedPayload<T> extends PaginationMeta {
    data: T[]
}

export interface UpdateScoringConfigurationPayload {
    peso_eficiencia: number
    peso_consistencia: number
    peso_volumen_ventas: number
    peso_pago_puntual: number
    peso_salud_red: number
    umbral_nivel_nuevo: number
    umbral_nivel_confiable: number
    umbral_nivel_verificado: number
    umbral_nivel_elite: number
    motivo_cambio?: string
}