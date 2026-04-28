<script setup>
// ============================================================
//  views/LiveMonitor.vue — Main Monitoring Dashboard
//  3-column layout: Patient info + ECG + Vitals | Alerts panel
// ============================================================
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { usePatientStore } from '../stores/patient.js'
import LiveECGDisplay from '../components/LiveECGDisplay.vue'

const store = usePatientStore()

// Patient is now selected from the Patients view and managed in the store
// The Active Patient details will be displayed in the Patient Info card automatically

const inputBPM = ref(store.currentBPM)
const inputSystolic = ref(store.systolicBP)
const inputDiastolic = ref(store.diastolicBP)
const inputNote = ref(store.sessionNote)

watch([inputBPM, inputSystolic, inputDiastolic, inputNote], ([bpm, sys, dia, note]) => {
  store.setBPM(bpm)
  store.systolicBP = sys
  store.diastolicBP = dia
  store.sessionNote = note
})

function handleStartMonitoring() {
  store.startSession()
}

function handleClear() {
  store.clearInputs()
  inputBPM.value = 72
  inputSystolic.value = 120
  inputDiastolic.value = 80
  inputNote.value = ''
}



// ── Current time for status card ─────────────────────────
const currentTime = ref(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
let clockInterval = null

// ── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  store.subscribeToHistory()
  clockInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 1000)
})

onUnmounted(() => {
  store.unsubscribeHistory()
  store.stopSession()
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<template>
  <div class="live-monitor">



    <!-- ═══ MAIN GRID: 70/30 ═════════════════════════════ -->
    <div class="monitor-grid">

      <!-- ─── LEFT + CENTER (70%) ─────────────────────── -->
      <div class="main-column">

        <!-- Patient Information Card -->
        <div class="card patient-info-card">
          <div class="card-header"><span>Patient Information</span></div>
          <div class="patient-info-grid">
            <div class="info-item">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="#059669" stroke-width="1.8"/>
                </svg>
              </div>
              <div>
                <span class="info-label">ID</span>
                <span class="info-value font-mono">{{ store.activePatient.id }}</span>
              </div>
            </div>
            <div class="info-item">
              <div>
                <span class="info-label">Name</span>
                <span class="info-value">{{ store.activePatient.fullName }}</span>
              </div>
            </div>
            <div class="info-item">
              <div>
                <span class="info-label">Age / Gender</span>
                <span class="info-value">{{ store.activePatient.age }} / {{ store.activePatient.gender }}</span>
              </div>
            </div>
            <div class="info-item">
              <div>
                <span class="info-label">Start Time</span>
                <span class="info-value font-mono">{{ store.formattedStartTime }}</span>
              </div>
            </div>
            <div class="info-item">
              <div>
                <span class="info-label">Session Duration</span>
                <span class="info-value font-mono text-primary-color">{{ store.formattedDuration }}</span>
              </div>
            </div>
            <div class="info-item">
              <div>
                <span class="info-label">Connection</span>
                <span class="info-value connection-status">
                  <span class="live-dot" style="width: 7px; height: 7px;"></span>
                  {{ store.connectionStatus }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Live ECG Card -->
        <div class="card ecg-card">
          <div class="card-header"><span>Live ECG (Simulated)</span></div>
          <LiveECGDisplay />
        </div>

        <!-- Manual Vital Input Card -->
        <div class="card vitals-card">
          <div class="card-header"><span>Manual Vital Input</span></div>
          <div class="vitals-grid">
            <div class="form-group">
              <label class="form-label" for="input-hr">Heart Rate (BPM)</label>
              <input id="input-hr" type="number" class="form-input" v-model.number="inputBPM" min="30" max="220" placeholder="72" />
            </div>
            <div class="form-group">
              <label class="form-label" for="input-sys">Systolic (mmHg)</label>
              <input id="input-sys" type="number" class="form-input" v-model.number="inputSystolic" min="60" max="250" placeholder="120" />
            </div>
            <div class="form-group">
              <label class="form-label" for="input-dia">Diastolic (mmHg)</label>
              <input id="input-dia" type="number" class="form-input" v-model.number="inputDiastolic" min="30" max="160" placeholder="80" />
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="input-note">Note (optional)</label>
              <input id="input-note" type="text" class="form-input" v-model="inputNote" placeholder="Enter clinical notes..." />
            </div>
          </div>
          <div class="vitals-actions">
            <button
              v-if="!store.isMonitoring"
              id="start-monitoring-btn"
              class="btn btn-success"
              @click="handleStartMonitoring"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
              Start Monitoring
            </button>
            <button
              v-else
              class="btn btn-danger"
              @click="store.stopSession"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
              </svg>
              Stop Monitoring
            </button>
            <button
              id="clear-btn"
              class="btn btn-ghost"
              @click="handleClear"
            >
              Clear Inputs
            </button>
          </div>
        </div>



      </div>

      <!-- ─── RIGHT COLUMN (30%) ─────────────────────── -->
      <div class="alerts-column">

        <!-- Current Clinical Status -->
        <div class="card status-card">
          <div class="card-header"><span>Current Clinical Status</span></div>
          <div class="status-display" :class="'status-' + store.clinicalStatus.color">
            <p class="status-level">{{ store.clinicalStatus.level }}</p>
            <div class="status-details">
              <div class="status-detail-item">
                <span class="status-detail-label">Reason</span>
                <span class="status-detail-value">{{ store.clinicalStatus.reason }}</span>
              </div>
              <div class="status-detail-item">
                <span class="status-detail-label">Last Updated</span>
                <span class="status-detail-value font-mono">{{ currentTime }}</span>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>

  </div>
</template>

<style scoped>


/* ═══ MONITOR GRID ════════════════════════════════════════= */
.monitor-grid {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 1rem;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alerts-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 80px;
}

/* ═══ PATIENT INFO CARD ═══════════════════════════════════= */
.patient-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.info-icon {
  width: 36px; height: 36px;
  background: var(--primary-dim);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.info-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}

.info-value {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary);
}

/* ═══ ECG CARD ═════════════════════════════════════════════ */
.ecg-card {
  padding: 0;
  overflow: hidden;
}

.ecg-card > .card-header {
  padding: 1rem 1.25rem 0.5rem;
  margin-bottom: 0;
}

/* ═══ VITALS CARD ══════════════════════════════════════════ */
.vitals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.vitals-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}



/* ═══ STATUS CARD ══════════════════════════════════════════ */
.status-display {
  border-radius: var(--radius-md);
  padding: 1rem;
}

.status-display.status-normal {
  background: var(--alert-normal-bg);
  border: 1px solid var(--alert-normal-bd);
}
.status-display.status-warning {
  background: var(--alert-warning-bg);
  border: 1px solid var(--alert-warning-bd);
}
.status-display.status-danger {
  background: var(--alert-danger-bg);
  border: 1px solid var(--alert-danger-bd);
}

.status-level {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
}

.status-normal .status-level { color: var(--alert-normal-fg); }
.status-warning .status-level { color: var(--alert-warning-fg); }
.status-danger .status-level { color: var(--alert-danger-fg); }

.status-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-detail-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.status-detail-value {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary);
}



/* ═══ RESPONSIVE ═══════════════════════════════════════════ */
@media (max-width: 1200px) {
  .monitor-grid {
    grid-template-columns: 1fr;
  }
  .alerts-column {
    position: static;
  }
  .patient-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .vitals-grid {
    grid-template-columns: 1fr;
  }
  .patient-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
