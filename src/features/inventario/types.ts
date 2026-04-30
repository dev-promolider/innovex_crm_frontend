export interface InventoryMovementActor {
    id: number
    nombre: string
    rango: string | null
}

export interface InventoryMovementKit {
    id: number
    nombre: string
}

export interface InventoryMovement {
    id: number
    tipo: string
    motivo: string | null
    cantidad: number
    stock_resultante_origen: number | null
    stock_resultante_destino: number | null
    referencia_id: number | null
    referencia_tipo: string | null
    created_at: string | null
    kit: InventoryMovementKit | null
    origen: InventoryMovementActor | null
    destino: InventoryMovementActor | null
    generado_por: {
        id: number
        nombre: string
    } | null
}

export interface InventoryMovementFilters {
    page?: number
    search?: string
    tipo?: string
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