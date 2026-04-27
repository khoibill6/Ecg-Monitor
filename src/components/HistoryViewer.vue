<script setup>
// ============================================================
//  HistoryViewer.vue — Historical Data Table + BPM Trend Chart
//  Uses Firestore onSnapshot() via Pinia store for real-time logs
//  and Chart.js (vue-chartjs) for BPM trend visualization.
// ============================================================
import { ref, computed, watch } from 'vue'
import { usePatientStore } from '../stores/patient.js'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
)

const store = usePatientStore()

// ── Search & Filter ─────────────────────────────────────
const searchQuery = ref('')
const filteredSessions = computed(() => {
  if (!searchQuery.value) return store.sessions
  const q = searchQuery.value.toLowerCase()
  return store.sessions.filter(s => 
    (s.patientName || '').toLowerCase().includes(q) || 
    (s.patientId || '').toLowerCase().includes(q)
  )
})

// ── Pagination ──────────────────────────────────────────
const currentPage = ref(1)
const rowsPerPage = 10

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredSessions.value.length / rowsPerPage))
)

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return filteredSessions.value.slice(start, start + rowsPerPage)
})

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

// Reset to page 1 when data changes significantly
watch(() => filteredSessions.value.length, () => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
})

// ── Chart Data (BPM Trend over Time) ────────────────────
const chartData = computed(() => {
  // Take last 30 sessions, reversed so oldest is on the left
  const recent = filteredSessions.value.slice(0, 30).reverse()

  const labels = recent.map(s => {
    if (!s.timestamp) return '--'
    return s.timestamp.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })
  })

  const bpmValues = recent.map(s => s.bpm)

  // Build color arrays for point coloring by BPM zone
  const pointColors = bpmValues.map(bpm => {
    if (bpm > 100) return '#ef4444'
    if (bpm < 60)  return '#f59e0b'
    return '#00ff88'
  })

  return {
    labels,
    datasets: [
      {
        label: 'BPM',
        data: bpmValues,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.08)',
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.35,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 11, weight: '600' },
        boxWidth: 12, boxHeight: 12,
        usePointStyle: true, pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: '#1a243a',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(56,189,248,0.3)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      titleFont: { family: 'Inter', weight: '700' },
      bodyFont: { family: 'JetBrains Mono' },
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.y} BPM`
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#4a5568', font: { size: 10, family: 'JetBrains Mono' }, maxRotation: 45 },
      grid: { color: 'rgba(255,255,255,0.04)' }
    },
    y: {
      min: 40,
      max: 140,
      ticks: {
        color: '#4a5568',
        font: { size: 10, family: 'JetBrains Mono' },
        stepSize: 20,
        callback: (v) => v + ' bpm'
      },
      grid: { color: 'rgba(255,255,255,0.04)' }
    }
  }
}

// ── Active tab (table vs chart) ─────────────────────────
const activeTab = ref('table')

// ── BPM zone helper ─────────────────────────────────────
function bpmBadge(bpm) {
  if (bpm > 100) return { cls: 'badge-danger',  label: 'HIGH' }
  if (bpm < 60)  return { cls: 'badge-warning', label: 'LOW' }
  return                { cls: 'badge-normal',  label: 'OK' }
}

// ── Format timestamp ────────────────────────────────────
function fmtTime(ts) {
  if (!ts) return '—'
  return ts.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}
</script>

<template>
  <div class="history-panel card">
    <!-- Header with tabs -->
    <div class="history-header">
      <div class="card-header" style="margin-bottom: 0;">
        <span>Session History</span>
      </div>

      <!-- Search input -->
      <div style="flex: 1; margin: 0 1rem; max-width: 250px;">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search patient name..." 
          class="form-input" 
          style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" 
        />
      </div>

      <div class="tab-group">
        <button
          class="tab-btn" :class="{ active: activeTab === 'table' }"
          @click="activeTab = 'table'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h18v18H3V3zm0 6h18m0 6H3M9 3v18m6-18v18"
                  stroke="currentColor" stroke-width="1.8"/>
          </svg>
          Table
        </button>
        <button
          class="tab-btn" :class="{ active: activeTab === 'chart' }"
          @click="activeTab = 'chart'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 20l5-7 4 4 5-8 4 4" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          BPM Trend
        </button>
      </div>
    </div>

    <!-- ── TABLE TAB ────────────────────────────────────── -->
    <div v-if="activeTab === 'table'" class="table-wrap">
      <div v-if="filteredSessions.length === 0" class="empty-state">
        <p v-if="searchQuery">No sessions found matching "{{ searchQuery }}".</p>
        <div v-else>
          <p>No session data yet.</p>
          <p class="text-xs text-muted">Set a patient and start monitoring to begin recording.</p>
        </div>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Patient</th>
            <th>BPM</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in paginatedSessions" :key="s.id">
            <td class="font-mono text-xs">{{ fmtTime(s.timestamp) }}</td>
            <td>{{ s.patientName }}</td>
            <td class="font-mono" :class="bpmBadge(s.bpm).cls === 'badge-danger' ? 'text-danger' : bpmBadge(s.bpm).cls === 'badge-warning' ? 'text-warning' : 'text-success'">
              {{ s.bpm }}
            </td>
            <td><span class="badge" :class="bpmBadge(s.bpm).cls">{{ bpmBadge(s.bpm).label }}</span></td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="filteredSessions.length > rowsPerPage" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="currentPage === 1" @click="prevPage">← Prev</button>
        <span class="page-info font-mono text-xs">{{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="currentPage === totalPages" @click="nextPage">Next →</button>
      </div>
    </div>

    <!-- ── CHART TAB ────────────────────────────────────── -->
    <div v-if="activeTab === 'chart'" class="chart-wrap">
      <div v-if="filteredSessions.length === 0" class="empty-state">
        <p>No data to plot yet.</p>
      </div>
      <div v-else class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Header ── */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* ── Tab buttons ── */
.tab-group { display: flex; gap: 0.35rem; }

.tab-btn {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover { background: var(--bg-hover); color: var(--text-secondary); }

.tab-btn.active {
  background: var(--cyan-dim);
  color: var(--cyan);
  border-color: rgba(56,189,248,0.3);
}

/* ── Table wrap ── */
.table-wrap {
  max-height: 400px;
  overflow-y: auto;
}

/* ── Empty state ── */
.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 0 0.25rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: 0.5rem;
}

.page-info { color: var(--text-muted); }

/* ── Chart ── */
.chart-wrap { padding: 0.25rem 0; }

.chart-container {
  height: 280px;
  position: relative;
}
</style>
