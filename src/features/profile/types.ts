export type ProfileDocumentType = 'dni' | 'pasaporte' | 'cedula' | 'ruc' | 'otro'

export interface UserProfile {
  uuid: string
  nombre: string
  apellido: string | null
  nombre_completo: string
  tipo_documento: ProfileDocumentType
  numero_documento: string
  email: string
  telefono: string
  direccion: string | null
  estado_global: string | null
  email_verificado_at: string | null
  tiene_biometria: boolean
}

export interface UpdateUserProfilePayload {
  nombre: string
  apellido: string
  tipo_documento: ProfileDocumentType
  numero_documento: string
  email: string
  telefono: string
  direccion?: string | null
}

export interface UpdateUserPasswordPayload {
  password: string
  password_confirmation: string
}
