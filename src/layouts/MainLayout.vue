<script setup>
// ============================================================
//  layouts/MainLayout.vue — Global Layout with Sidebar
//  Left Sidebar + Top Header + Footer + Content Area
// ============================================================
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../firebase.js'
import { signOut } from 'firebase/auth'

const router = useRouter()
const route  = useRoute()

// ── Navigation Menu Items ────────────────────────────────
const menuItems = [
  { label: 'Live Monitor', icon: 'monitor',  route: '/live-monitor' },
  { label: 'Patients',     icon: 'users',    route: '/patients' },
  { label: 'History',      icon: 'history',  route: '/history' },
  { label: 'Reports',      icon: 'reports',  route: '/reports' },
  { label: 'Settings',     icon: 'settings', route: '/settings' }
]

// ── Current page title ───────────────────────────────────
const pageTitle = computed(() => {
  const item = menuItems.find(m => m.route === route.path)
  return item ? item.label : 'Dashboard'
})

// ── Logout ───────────────────────────────────────────────
async function handleLogout() {
  await signOut(auth)
  router.push('/login')
}



</script>

<template>
  <div class="app-layout">

    <!-- ═══ LEFT SIDEBAR ═══════════════════════════════════ -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h3l3-7 3 14 3-10 2 3h4"
                  stroke="#059669" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <p class="logo-title">ECG Monitor</p>
          <p class="logo-sub">Student Project</p>
        </div>
      </div>

      <hr class="sidebar-divider" />

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.route"
          :to="item.route"
          class="nav-item"
          active-class="active"
        >
          <!-- Icons -->
          <svg v-if="item.icon === 'monitor'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M7 10h2l2-4 2 8 2-5 1 1h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="item.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="item.icon === 'history'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="item.icon === 'reports'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.8"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="item.icon === 'settings'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="1.8"/>
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- ── Bottom Section ── -->
      <div class="sidebar-bottom">
        <hr class="sidebar-divider" />
        <button class="nav-item logout-btn" @click="handleLogout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
        <div class="sidebar-user">
          <div class="user-avatar-sm">TG</div>
          <div>
            <p class="user-name-sm">Dr. Tran Le Giang</p>
            <p class="user-role-sm">Cardiologist</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- ═══ MAIN AREA (Header + Content + Footer) ═════════ -->
    <div class="main-area">

      <!-- ── Top Header ── -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">

          <!-- Help -->
          <button class="header-icon-btn" title="Help">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
          <!-- User -->
          <div class="header-user">
            <div class="user-avatar-header">TG</div>
            <div class="user-info-header">
              <p class="user-name-header">Dr. Tran Le Giang</p>
              <p class="user-role-header">Cardiologist</p>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Content Area ── -->
      <main class="content-area">
        <RouterView />
      </main>

      <!-- ── Footer ── -->
      <footer class="app-footer">
        <span>© 2026 ECG Monitor - Student Project</span>
      </footer>
    </div>

  </div>
</template>

<style scoped>
/* ═══ LAYOUT ═══════════════════════════════════════════════ */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

/* ═══ SIDEBAR ══════════════════════════════════════════════ */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.85rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 50;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.4rem;
  margin-bottom: 0.25rem;
}

.logo-icon {
  width: 40px; height: 40px;
  background: #ecfdf5;
  border: 1px solid rgba(5,150,105,0.15);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.logo-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.logo-sub {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.3px;
}

.sidebar-divider {
  height: 1px;
  border: none;
  background: var(--border-subtle);
  margin: 1rem 0.4rem;
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.85rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
  border-left-color: var(--sidebar-active-border);
}

/* Bottom section */
.sidebar-bottom {
  margin-top: auto;
}

.logout-btn { color: var(--text-muted); }
.logout-btn:hover { color: #dc2626; background: rgba(220,38,38,0.05); }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.65rem;
  margin-top: 0.5rem;
  border-radius: var(--radius-md);
  background: var(--bg-panel);
}

.user-avatar-sm {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.user-name-sm {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-role-sm {
  font-size: 0.65rem;
  color: var(--text-muted);
}

/* ═══ MAIN AREA ════════════════════════════════════════════ */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── Top Header ── */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-xs);
  position: sticky;
  top: 0;
  z-index: 40;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon-btn {
  position: relative;
  width: 38px; height: 38px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.header-icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.notif-badge {
  position: absolute;
  top: -4px; right: -4px;
  width: 18px; height: 18px;
  background: #dc2626;
  color: #fff;
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: 0.5rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--border-subtle);
}

.user-avatar-header {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.user-name-header {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-role-header {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.user-info-header { line-height: 1; }

/* ── Content ── */
.content-area {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
}

/* ── Footer ── */
.app-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.5rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

/* ═══ RESPONSIVE ═══════════════════════════════════════════ */
@media (max-width: 1024px) {
  .sidebar {
    width: 72px;
    min-width: 72px;
    padding: 1rem 0.5rem;
  }
  .sidebar-logo > div:last-child,
  .nav-item span,
  .sidebar-user > div:last-child,
  .logout-btn span,
  .logo-sub { display: none; }
  .nav-item { justify-content: center; padding: 0.6rem; border-left: none; }
  .nav-item.active { border-left: none; border-bottom: 2px solid var(--sidebar-active-border); }
  .sidebar-user { justify-content: center; padding: 0.5rem; }
}

@media (max-width: 768px) {
  .header-user .user-info-header { display: none; }
  .page-title { font-size: 1.1rem; }
}


</style>
