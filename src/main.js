// ============================================================
//  main.js — Application Bootstrap
//  Waits for Firebase Auth to initialize before mounting
// ============================================================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { auth } from './firebase.js'
import './style.css'

// Wait for Firebase Auth to resolve its initial state
// before mounting the Vue app (prevents auth-guard flicker)
let appMounted = false

auth.onAuthStateChanged(() => {
  if (!appMounted) {
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
    appMounted = true
  }
})
