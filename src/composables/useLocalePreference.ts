import { computed } from 'vue'
import { i18n, detectBrowserLocale, localeStorageKey, type SupportedLocale } from '@/i18n'

const { locale } = i18n.global

const persistLocale = (nextLocale: SupportedLocale) => {
  localStorage.setItem(localeStorageKey, nextLocale)
}

const readPersistedLocale = (): SupportedLocale | null => {
  const persisted = localStorage.getItem(localeStorageKey)

  if (persisted === 'es' || persisted === 'en') {
    return persisted
  }

  return null
}

export const hydrateLocalePreference = () => {
  locale.value = readPersistedLocale() ?? detectBrowserLocale()
}

export function useLocalePreference() {
  const currentLocale = computed<SupportedLocale>({
    get: () => locale.value as SupportedLocale,
    set: (value) => {
      locale.value = value
      persistLocale(value)
    },
  })

  const setLocale = (value: SupportedLocale) => {
    currentLocale.value = value
  }

  const useBrowserLocale = () => {
    localStorage.removeItem(localeStorageKey)
    locale.value = detectBrowserLocale()
  }

  return {
    locale: currentLocale,
    setLocale,
    useBrowserLocale,
    isSpanish: computed(() => currentLocale.value === 'es'),
    isEnglish: computed(() => currentLocale.value === 'en'),
  }
}
