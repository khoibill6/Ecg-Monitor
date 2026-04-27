// ============================================================
//  router/index.js — Vue Router 4 with Auth Guard
//  Routes: /login (public), /live-monitor (protected), etc.
// ============================================================
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase.js'

// Lazy-load views for better performance
const Login       = () => import('../views/Login.vue')
const MainLayout  = () => import('../layouts/MainLayout.vue')
const LiveMonitor = () => import('../views/LiveMonitor.vue')
const Patients    = () => import('../views/Patients.vue')
const History     = () => import('../views/History.vue')
const Reports     = () => import('../views/Reports.vue')
const Settings    = () => import('../views/Settings.vue')

const routes = [
  // Root path redirects to login
  { path: '/', redirect: '/login' },

  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true } // redirect to /live-monitor if already logged in
  },

  // ── Protected routes wrapped in MainLayout ──
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'live-monitor',
        name: 'LiveMonitor',
        component: LiveMonitor
      },
      {
        path: 'patients',
        name: 'Patients',
        component: Patients
      },
      {
        path: 'history',
        name: 'History',
        component: History
      },
      {
        path: 'reports',
        name: 'Reports',
        component: Reports
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      }
    ]
  },

  // Legacy /dashboard redirects to new route
  { path: '/dashboard', redirect: '/live-monitor' },

  // Catch-all: redirect unknown paths to login
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Navigation Guard ──────────────────────────────────────
// We wait for Firebase Auth to resolve its initial state
// before making any routing decision (avoids flicker).
let authResolved = false
let currentUser  = null

// Listen to auth state changes
auth.onAuthStateChanged(user => {
  currentUser  = user
  authResolved = true
})

router.beforeEach(async (to) => {
  // Wait until Firebase has resolved the auth state (first load)
  if (!authResolved) {
    await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        currentUser  = user
        authResolved = true
        unsub()
        resolve()
      })
    })
  }

  const isAuthenticated = !!currentUser

  // Protected route — must be logged in
  if (to.meta.requiresAuth && !isAuthenticated) return '/login'

  // Guest-only route — already authenticated, send to live monitor
  if (to.meta.requiresGuest && isAuthenticated) return '/live-monitor'

  return true
})

export default router

