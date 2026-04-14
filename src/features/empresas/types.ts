export type EmpresaEstado = 'configuracion' | 'activa' | 'suspendida' | 'inactiva'

export interface EmpresaListItem {
    id: number
    uuid: string
    nombre: string
    nombre_comercial: string | null
    ruc_nit: string | null
    logo_url: string | null
    color_primario: string | null
    color_secundario: string | null
    moneda_iso: string | null
    zona_horaria: string | null
    email_contacto: string | null
    telefono_contacto: string | null
    sitio_web: string | null
    estado: EmpresaEstado
    plan_saas: string | null
    max_distribuidores: number | null
    membresias_activas_count: number
    created_at: string | null
    updated_at: string | null
}

export interface ConfiguracionRangoResumen {
    id: number
    nombre_rango: string
    nivel: number
    max_distribuidores_directos: number | null
    limite_kits_credito: number
    porcentaje_comision_cascada: number
    activo: boolean
}

export interface ConfiguracionPagosResumen {
    id: number
    modelo_pago: string
    dias_plazo_bullet: number | null
    numero_cuotas: number | null
    periodicidad_dias: number | null
    dias_gracia_recepcion: number
    tolerancia_pago_horas: number
    vigente_desde: string | null
}

export interface MembresiaActivaResumen {
    id: number
    estado_validacion: string
    nivel_confianza: number
    perfil_web_activo: boolean
    validado_at: string | null
}

export interface EmpresaDetail extends EmpresaListItem {
    configuracion_rangos: ConfiguracionRangoResumen[]
    configuracion_pagos: ConfiguracionPagosResumen | null
    membresias_activas: MembresiaActivaResumen[]
}

export interface EmpresasPaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface CreateEmpresaPayload {
    nombre: string
    nombre_comercial?: string
    ruc_nit?: string
    logo_url?: string
    color_primario?: string
    color_secundario?: string
    moneda_iso?: string
    zona_horaria?: string
    email_contacto?: string
    telefono_contacto?: string
    sitio_web?: string
    plan_saas?: string
    max_distribuidores?: number
}
