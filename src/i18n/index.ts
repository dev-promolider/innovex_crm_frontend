import { createI18n } from 'vue-i18n'
import en from './messages/en'
import es from './messages/es'

export const supportedLocales = ['es', 'en'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const fallbackLocale: SupportedLocale = 'es'
export const localeStorageKey = 'locale_code'

export const messages = {
  es,
  en,
}

export const resolveSupportedLocale = (locale: string | null | undefined): SupportedLocale => {
  if (!locale) {
    return fallbackLocale
  }

  const normalized = locale.toLowerCase().split('-')[0]
  return supportedLocales.includes(normalized as SupportedLocale)
    ? (normalized as SupportedLocale)
    : fallbackLocale
}

export const detectBrowserLocale = (): SupportedLocale => {
  if (typeof navigator === 'undefined') {
    return fallbackLocale
  }

  return resolveSupportedLocale(navigator.language)
}

export const i18n = createI18n({
  legacy: false,
  locale: detectBrowserLocale(),
  fallbackLocale,
  messages,
})

export default i18n
