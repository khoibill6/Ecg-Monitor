<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePatientStore } from '../stores/patient.js'

const store = usePatientStore()
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedSession = ref(null)

const filteredSessions = computed(() => {
  if (!searchQuery.value) return store.sessions
  const q = searchQuery.value.toLowerCase()
  return store.sessions.filter(s => 
    (s.patientName && s.patientName.toLowerCase().includes(q)) ||
    (s.patientId && s.patientId.toLowerCase().includes(q))
  )
})

function fmtTime(ts) {
  if (!ts) return '—'
  return ts.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function fmtDuration(secs) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

function bpmBadge(bpm) {
  const { tachycardia, bradycardia } = store.alarmSettings
  if (bpm > tachycardia) return { cls: 'badge-danger',  label: 'HIGH' }
  if (bpm < bradycardia) return { cls: 'badge-warning', label: 'LOW' }
  return                 { cls: 'badge-normal',  label: 'NORMAL' }
}

function exportToCSV() {
  if (filteredSessions.value.length === 0) return
  const headers = ['Date', 'Patient ID', 'Patient Name', 'Duration', 'BPM', 'Systolic', 'Diastolic', 'Note']
  const rows = filteredSessions.value.map(s => [
    fmtTime(s.timestamp), s.patientId, s.patientName, fmtDuration(s.duration), 
    s.bpm, s.systolicBP || '', s.diastolicBP || '', s.note || ''
  ])
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.map(item => `"${(item||'').toString().replace(/"/g, '""')}"`).join(",")).join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "ecg_history_export.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function viewDetails(session) {
  selectedSession.value = session
  showDetailModal.value = true
}

function closeDetails() {
  showDetailModal.value = false
  selectedSession.value = null
}

onMounted(() => {
  store.subscribeToHistory()
})

onUnmounted(() => {
  if (!store.isMonitoring) {
    store.unsubscribeHistory()
  }
})
</script>

<template>
  <div class="history-page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Session History</h1>
        <p class="page-subtitle">Review all past ECG recordings and vitals data.</p>
      </div>
      <div class="header-actions">
        <input type="text" v-model="searchQuery" class="form-input" placeholder="Search by name or ID..." style="width: 250px;" />
        <button class="btn btn-outline" @click="exportToCSV">Export List</button>
      </div>
    </div>

    <div class="card history-card">
      <div class="card-header">
        <span>All Recorded Sessions</span>
        <span class="text-muted text-xs">Showing latest 100 records</span>
      </div>
      
      <div v-if="filteredSessions.length === 0" style="padding: 3rem; text-align: center; color: var(--text-muted);">
        <p>No historical sessions found.</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Patient</th>
            <th>Age/Gen</th>
            <th>Duration</th>
            <th>Avg HR</th>
            <th>Blood Pressure</th>
            <th>Clinical Note</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredSessions" :key="s.id">
            <td class="font-mono text-xs">{{ fmtTime(s.timestamp) }}</td>
            <td>
              <p style="font-weight: 600; margin-bottom: 2px;">{{ s.patientName }}</p>
              <p class="font-mono text-xs text-muted">{{ s.patientId }}</p>
            </td>
            <td class="text-xs">{{ s.age }} / {{ s.gender ? s.gender.charAt(0) : 'N/A' }}</td>
            <td class="font-mono text-xs">{{ fmtDuration(s.duration) }}</td>
            <td class="font-mono" :class="bpmBadge(s.bpm).cls === 'badge-danger' ? 'text-danger' : bpmBadge(s.bpm).cls === 'badge-warning' ? 'text-warning' : 'text-success'">
              {{ s.bpm }}
            </td>
            <td class="font-mono text-xs">
              {{ s.systolicBP || '—' }}/{{ s.diastolicBP || '—' }}
            </td>
            <td class="text-xs max-w-note truncate">{{ s.note || '—' }}</td>
            <td>
              <span class="badge" :class="bpmBadge(s.bpm).cls">
                {{ bpmBadge(s.bpm).label }}
              </span>
            </td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="viewDetails(s)">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Session Details Modal -->
    <div class="modal-overlay" v-if="showDetailModal && selectedSession">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Session Details</h3>
          <button class="modal-close" @click="closeDetails">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Patient:</span>
            <span class="detail-val">{{ selectedSession.patientName }} ({{ selectedSession.patientId }})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-val">{{ fmtTime(selectedSession.timestamp) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-val">{{ fmtDuration(selectedSession.duration) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Avg HR:</span>
            <span class="detail-val" :class="bpmBadge(selectedSession.bpm).cls === 'badge-danger' ? 'text-danger' : bpmBadge(selectedSession.bpm).cls === 'badge-warning' ? 'text-warning' : 'text-success'">
              {{ selectedSession.bpm }} BPM
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Blood Pressure:</span>
            <span class="detail-val">{{ selectedSession.systolicBP || '—' }} / {{ selectedSession.diastolicBP || '—' }} mmHg</span>
          </div>
          <div class="detail-row" style="flex-direction: column; align-items: flex-start; margin-top: 0.5rem;">
            <span class="detail-label" style="margin-bottom: 0.5rem;">Clinical Notes:</span>
            <div class="detail-note-box">{{ selectedSession.note || 'No notes provided.' }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closeDetails">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.history-card {
  padding: 0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.max-w-note {
  max-width: 200px;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modal styles */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: var(--bg-surface); width: 100%; max-width: 500px;
  border-radius: var(--radius-xl); box-shadow: var(--shadow-xl);
}
.modal-header {
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-subtle);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-close:hover { color: var(--text-primary); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem; }
.detail-row { display: flex; justify-content: space-between; align-items: center; }
.detail-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.detail-val { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
.detail-note-box { background: var(--bg-base); padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem; width: 100%; min-height: 80px;}
.modal-footer {
  padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-subtle);
  display: flex; justify-content: flex-end;
}
</style>
