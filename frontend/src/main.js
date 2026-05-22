import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'

// PrimeVue Services
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

// Create Vue app instance
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

// Register PrimeVue services
app.use(ToastService)
app.use(ConfirmationService)

// Register directives
app.directive('tooltip', Tooltip)

app.mount('#app')
