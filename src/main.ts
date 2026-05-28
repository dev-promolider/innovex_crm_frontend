import { createApp } from 'vue'
import './style.css'
import './styles/admin-list-page.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { hydrateLocalePreference } from './composables/useLocalePreference'
import { installPrimeVue } from './plugins/primevue'

const app = createApp(App)

installPrimeVue(app)
hydrateLocalePreference()

app.use(router)
app.use(i18n)
app.mount('#app')
