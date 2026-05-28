import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { Theme } from '@primeuix/styled'
import BaseStyle from '@primevue/core/base/style'
import ButtonStyle from 'primevue/button/style'
import DataTableStyle from 'primevue/datatable/style'
import IconFieldStyle from 'primevue/iconfield/style'
import InputTextStyle from 'primevue/inputtext/style'
import PaginatorStyle from 'primevue/paginator/style'
import TagStyle from 'primevue/tag/style'

type ThemeStyleModule = {
  getThemeStyleSheet: () => string
}

type BaseThemeStyleModule = {
  getCommonThemeStyleSheet: () => string
}

const ensureStyleTag = (markup: string) => {
  if (typeof document === 'undefined' || !markup) {
    return
  }

  const template = document.createElement('template')
  template.innerHTML = markup.trim()

  const styleElement = template.content.firstElementChild

  if (!(styleElement instanceof HTMLStyleElement)) {
    return
  }

  const styleId = styleElement.getAttribute('data-primevue-style-id')

  if (styleId && document.querySelector(`style[data-primevue-style-id="${styleId}"]`)) {
    return
  }

  document.head.appendChild(styleElement)
}

const loadPrimeVueThemeStyles = () => {
  Theme.setTheme({ preset: Aura })

  const baseStyle = BaseStyle as unknown as BaseThemeStyleModule

  const themeSheets = [
    baseStyle.getCommonThemeStyleSheet(),
    (ButtonStyle as unknown as ThemeStyleModule).getThemeStyleSheet(),
    (DataTableStyle as unknown as ThemeStyleModule).getThemeStyleSheet(),
    (IconFieldStyle as unknown as ThemeStyleModule).getThemeStyleSheet(),
    (InputTextStyle as unknown as ThemeStyleModule).getThemeStyleSheet(),
    (PaginatorStyle as unknown as ThemeStyleModule).getThemeStyleSheet(),
    (TagStyle as unknown as ThemeStyleModule).getThemeStyleSheet(),
  ]

  themeSheets.forEach((sheet) => {
    ensureStyleTag(sheet)
  })
}

export const installPrimeVue = (app: App) => {
  app.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
    },
  })

  loadPrimeVueThemeStyles()
}
