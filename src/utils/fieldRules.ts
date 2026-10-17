export type DocumentType = 'dni' | 'cedula' | 'ruc' | 'pasaporte' | 'otro'

export const FIELD_LIMITS = {
  personName: 100,
  email: 180,
  address: 255,
  companyTaxId: 20,
  accountNumber: 34,
  maxDistributors: 100000,
} as const

const documentRules: Record<DocumentType, { maxLength: number; pattern: RegExp; label: string }> = {
  dni: { maxLength: 8, pattern: /^\d{8}$/, label: 'El DNI debe tener 8 dígitos.' },
  cedula: { maxLength: 10, pattern: /^\d{6,10}$/, label: 'La cédula debe tener de 6 a 10 dígitos.' },
  ruc: { maxLength: 11, pattern: /^\d{11}$/, label: 'El RUC debe tener 11 dígitos.' },
  pasaporte: { maxLength: 20, pattern: /^[A-Z0-9]{5,20}$/, label: 'El pasaporte debe tener de 5 a 20 letras o números.' },
  otro: { maxLength: 20, pattern: /^[A-Z0-9]{5,20}$/, label: 'El documento debe tener de 5 a 20 letras o números.' },
}

const nationalPhoneLengths: Record<string, number[]> = {
  PE: [9],
  VE: [10],
  CO: [10],
  MX: [10],
  CL: [9],
  AR: [10],
  EC: [9],
  BO: [8],
  PY: [9],
  UY: [8],
  PA: [8],
  CR: [8],
  DO: [10],
  US: [10],
  ES: [9],
  BR: [10, 11],
}

export const maxPhoneDigits = (countryIso: string): number =>
  Math.max(...(nationalPhoneLengths[countryIso] ?? [15]))

export const phoneDigitLengths = (countryIso: string): readonly number[] =>
  nationalPhoneLengths[countryIso] ?? []

export const sanitizePersonName = (value: string): string =>
  value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, FIELD_LIMITS.personName)

export const sanitizeEmail = (value: string): string =>
  value.replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~@-]/g, '').slice(0, FIELD_LIMITS.email)

export const isValidEmail = (value: string): boolean =>
  value.length <= FIELD_LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

export const sanitizeAddress = (value: string): string =>
  value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, FIELD_LIMITS.address)

export const sanitizeCompanyTaxId = (value: string): string =>
  value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, FIELD_LIMITS.companyTaxId)

export const isValidCompanyTaxId = (value: string): boolean =>
  value.length <= FIELD_LIMITS.companyTaxId && /^[a-zA-Z0-9-]*$/.test(value)

export const sanitizeDocument = (value: string, type: DocumentType): string => {
  const rule = documentRules[type]
  if (type === 'dni' || type === 'cedula' || type === 'ruc') {
    return value.replace(/\D/g, '').slice(0, rule.maxLength)
  }

  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, rule.maxLength)
}

export const documentMaxLength = (type: DocumentType): number => documentRules[type].maxLength

export const validateDocument = (value: string, type: DocumentType): string =>
  documentRules[type].pattern.test(value) ? '' : documentRules[type].label

export const sanitizePhoneDigits = (value: string, countryIso: string): string =>
  value.replace(/\D/g, '').slice(0, maxPhoneDigits(countryIso))

export const validatePhoneDigits = (value: string, countryIso: string): string => {
  const allowedLengths = phoneDigitLengths(countryIso)
  if (allowedLengths.includes(value.length)) return ''

  const lengthDescription = allowedLengths.length === 2
    ? `${allowedLengths[0]} u ${allowedLengths[1]}`
    : String(allowedLengths[0] ?? 15)
  return `El teléfono debe tener ${lengthDescription} dígitos nacionales.`
}

export const sanitizeMaxDistributors = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, String(FIELD_LIMITS.maxDistributors).length)
  return Number(digits) > FIELD_LIMITS.maxDistributors ? String(FIELD_LIMITS.maxDistributors) : digits
}

export const sanitizeInteger = (value: string, maxDigits = 6): string =>
  value.replace(/\D/g, '').slice(0, maxDigits)

export const sanitizeDecimal = (value: string, maxLength = 12): string => {
  const normalized = value.replace(/[^\d.,]/g, '').replace(',', '.')
  const [integer = '', ...decimalParts] = normalized.split('.')
  const decimal = decimalParts.join('').slice(0, 2)
  return `${integer.slice(0, maxLength - (decimal ? decimal.length + 1 : 0))}${decimalParts.length ? `.${decimal}` : ''}`.slice(0, maxLength)
}

export const isValidIntegerInRange = (value: string, min: number, max: number): boolean => {
  if (!/^\d+$/.test(value)) return false
  const number = Number(value)
  return Number.isInteger(number) && number >= min && number <= max
}

export const isValidPositiveDecimal = (value: string): boolean =>
  /^\d+(?:\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value)) && Number(value) > 0

export const validateMaxDistributors = (value: string): string => {
  if (!value) return ''
  const number = Number(value)
  return Number.isInteger(number) && number >= 1 && number <= FIELD_LIMITS.maxDistributors
    ? ''
    : 'Ingresa un entero entre 1 y 100000 o deja el campo vacío para indicar sin límite.'
}

export const sanitizeAccountNumber = (value: string): string =>
  value.replace(/[^0-9-]/g, '').slice(0, FIELD_LIMITS.accountNumber)

export const sanitizeText = (value: string, maxLength: number): string =>
  value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength)
