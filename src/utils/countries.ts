export interface PhoneCountry {
  iso: string
  nombre: string
  prefijo: string
  placeholder: string
}

export const countries: PhoneCountry[] = [
  { iso: 'VE', nombre: 'Venezuela', prefijo: '+58', placeholder: '412 1234567' },
  { iso: 'PE', nombre: 'Perú', prefijo: '+51', placeholder: '999 999 999' },
  { iso: 'CO', nombre: 'Colombia', prefijo: '+57', placeholder: '300 1234567' },
  { iso: 'MX', nombre: 'México', prefijo: '+52', placeholder: '55 1234 5678' },
  { iso: 'CL', nombre: 'Chile', prefijo: '+56', placeholder: '9 1234 5678' },
  { iso: 'AR', nombre: 'Argentina', prefijo: '+54', placeholder: '11 1234 5678' },
  { iso: 'EC', nombre: 'Ecuador', prefijo: '+593', placeholder: '99 123 4567' },
  { iso: 'BO', nombre: 'Bolivia', prefijo: '+591', placeholder: '7123 4567' },
  { iso: 'PY', nombre: 'Paraguay', prefijo: '+595', placeholder: '981 123456' },
  { iso: 'UY', nombre: 'Uruguay', prefijo: '+598', placeholder: '94 123 456' },
  { iso: 'PA', nombre: 'Panamá', prefijo: '+507', placeholder: '6123 4567' },
  { iso: 'CR', nombre: 'Costa Rica', prefijo: '+506', placeholder: '8312 3456' },
  { iso: 'DO', nombre: 'República Dominicana', prefijo: '+1', placeholder: '809 123 4567' },
  { iso: 'US', nombre: 'Estados Unidos', prefijo: '+1', placeholder: '212 123 4567' },
  { iso: 'ES', nombre: 'España', prefijo: '+34', placeholder: '612 345 678' },
  { iso: 'BR', nombre: 'Brasil', prefijo: '+55', placeholder: '11 91234 5678' },
]