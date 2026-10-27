import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'

import App from './App.vue'
import { createQueryClient } from './lib/queryClient'
import './style.css'

const app = createApp(App)
app.use(VueQueryPlugin, { queryClient: createQueryClient() })
app.mount('#app')
