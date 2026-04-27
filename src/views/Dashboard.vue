<script setup>
// ============================================================
//  views/Dashboard.vue — Protected ICU Monitoring Dashboard
//  Layout: Header | Sidebar (PatientInfo) | Main (ECG + History)
// ============================================================
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase.js'
import { signOut } from 'firebase/auth'
import { usePatientStore } from '../stores/patient.js'
import LiveECGDisplay  from '../components/LiveECGDisplay.vue'
import PatientInfoPanel from '../components/PatientInfoPanel.vue'
import HistoryViewer   from '../components/HistoryViewer.vue'

const router  = useRouter()
const store   = usePatientStore()

// Start listening to Firestore history when dashboard mounts
onMounted(() => {
  store.subscribeToHistory()
})

// Cleanup Firestore listener when leaving dashboard
onUnmounted(() => {
  store.unsubscribeHistory()
})

// Sign out the current user and redirect to login
async function handleLogout() {
  await signOut(auth)
  router.push('/login')
}

// Format current date/time for header
function formatDateTime() {
  return new Date().toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit',
    month:   'short', year:  'numeric',
    hour:    '2-digit', minute: '2-digit',
    second:  '2-digit', hour12: false
  })
}
</script>

<template>
  <div class="dashboard-wrapper">

    <!-- ── TOP HEADER ────────────────────────────────────── -->
    <header class="top-header">
      <!-- Left: Branding -->
      <div class="header-brand">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h3l3-7 3 14 3-10 2 3h4"
                  stroke="#00ff88" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <p class="brand-sub">VNU-IU BIOMEDICAL ENGINEERING</p>
          <h1 class="brand-title">ECG Monitor Pro</h1>
        </div>
      </div>

      <!-- Center: Status indicators -->
      <div class="header-status">
        <div class="status-chip">
          <span class="live-dot"></span>
          <span>LIVE</span>
        </div>
        <div class="status-chip">
          <span class="status-dot status-db"></span>
          <span>Firebase Connected</span>
        </div>
      </div>

      <!-- Right: User info + Actions -->
      <div class="header-actions">
        <div class="user-info">
          <div class="user-avatar">
            {{ auth.currentUser?.email?.charAt(0).toUpperCase() ?? 'D' }}
          </div>
          <div>
            <p class="user-name">{{ auth.currentUser?.email ?? 'Clinician' }}</p>
            <p class="user-role">Attending Physician</p>
          </div>
        </div>
        <button id="logout-btn" class="btn btn-ghost btn-sm" @click="handleLogout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Logout
        </button>
      </div>
    </header>

    <!-- ── MAIN GRID ──────────────────────────────────────── -->
    <div class="dashboard-grid">

      <!-- LEFT SIDEBAR: Patient Info -->
      <aside class="sidebar">
        <PatientInfoPanel />
      </aside>

      <!-- CENTER + BOTTOM RIGHT: ECG + History -->
      <main class="main-content">
        <!-- ECG Waveform (top / center) -->
        <section class="ecg-section">
          <LiveECGDisplay />
        </section>

        <!-- History Viewer (bottom) -->
        <section class="history-section">
          <HistoryViewer />
        </section>
      </main>

    </div><!-- /.dashboard-grid -->

    <!-- ── FOOTER ─────────────────────────────────────────── -->
    <footer class="dashboard-footer">
      <span>© 2026 VNU-IU Biomedical Engineering · Real-Time ECG Monitoring System v2.0</span>
      <span class="footer-time" id="footer-clock">{{ formatDateTime() }}</span>
    </footer>

  </div>
</template>

<style scoped>
/* ── Wrapper ── */
.dashboard-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
}

/* ── Top Header ── */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Branding */
.brand-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #0f2027, #203a43);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-glow-green);
  flex-shrink: 0;
}
.header-brand { display: flex; align-items: center; gap: 0.75rem; }
.brand-sub {
  font-size: 0.55rem; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--text-muted);
}
.brand-title {
  font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 0;
}

/* Status chips */
.header-status { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.status-chip {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 99px;
  font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);
}
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
}
.status-db { background: var(--cyan); }

/* User info */
.header-actions { display: flex; align-items: center; gap: 1rem; }
.user-info { display: flex; align-items: center; gap: 0.6rem; }
.user-avatar {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 800; color: #fff;
  flex-shrink: 0;
}
.user-name  { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
.user-role  { font-size: 0.65rem; color: var(--text-muted); }

/* ── Dashboard Grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  flex: 1;
  overflow: hidden;
}

/* LEFT sidebar */
.sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  padding: 1.25rem;
  overflow-y: auto;
  height: calc(100vh - 57px - 36px); /* viewport minus header and footer */
}

/* MAIN content area */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  height: calc(100vh - 57px - 36px);
  padding: 1.25rem;
  gap: 1.25rem;
}

.ecg-section     { flex: 0 0 auto; }
.history-section { flex: 1 1 auto; }

/* ── Footer ── */
.dashboard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}
.footer-time { font-family: var(--font-mono); color: var(--cyan); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .sidebar {
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
  }
  .main-content { height: auto; }
}

@media (max-width: 600px) {
  .header-status { display: none; }
  .user-info p   { display: none; }
}
</style>
