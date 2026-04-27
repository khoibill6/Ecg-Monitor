<script setup>
// ============================================================
//  PatientInfoPanel.vue — Patient Demographics Form/Display
//  Editable form with save/edit toggle.
//  Auto-syncs ECG sessions to Firestore via watch().
// ============================================================
import { ref, watch } from 'vue'
import { usePatientStore } from '../stores/patient.js'

const store = usePatientStore()

// ── Local form state ─────────────────────────────────────
const form = ref({
  id:        store.activePatient.id        || '',
  fullName:  store.activePatient.fullName  || '',
  age:       store.activePatient.age       || '',
  bloodType: store.activePatient.bloodType || ''
})

const isEditing = ref(true) // start in edit mode

// ── Auto-generate Patient ID ─────────────────────────────
watch(() => form.value.fullName, (newVal) => {
  if (newVal && !form.value.id) {
    form.value.id = 'PT-' + Math.floor(1000 + Math.random() * 9000)
  }
})

// ── Save patient info to the Pinia store ─────────────────
function savePatient() {
  if (!form.value.fullName.trim()) return
  store.setPatient({ ...form.value })
  isEditing.value = false
}

function editPatient() {
  isEditing.value = true
}

// ── Auto-sync: watch BPM changes → save to Firestore ────
// Whenever BPM changes AND a patient is set, push a session snapshot
let saveThrottle = null
watch(
  () => store.currentBPM,
  () => {
    if (!store.hasPatient) return
    // Throttle saves to once every 5 seconds
    if (!saveThrottle) {
      saveThrottle = setTimeout(() => {
        store.saveSession([]) // ECG buffer will be picked from store
        saveThrottle = null
      }, 5000)
    }
  }
)

// ── Blood type options ───────────────────────────────────
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
</script>

<template>
  <div class="patient-panel">
    <!-- Section header -->
    <div class="card-header">
      <span>Patient Information</span>
    </div>

    <!-- ── Editing Mode ──────────────────────────────────── -->
    <form v-if="isEditing" @submit.prevent="savePatient" class="patient-form">
      <div class="form-group">
        <label class="form-label" for="pt-id">Patient ID</label>
        <input
          id="pt-id"
          v-model="form.id"
          type="text"
          class="form-input"
          placeholder="e.g. PT-001"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="pt-name">Full Name *</label>
        <input
          id="pt-name"
          v-model="form.fullName"
          type="text"
          class="form-input"
          placeholder="Enter patient full name"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="pt-age">Age</label>
          <input
            id="pt-age"
            v-model.number="form.age"
            type="number"
            class="form-input"
            min="0" max="150"
            placeholder="Age"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="pt-blood">Blood Type</label>
          <select id="pt-blood" v-model="form.bloodType" class="form-select">
            <option value="" disabled>Select</option>
            <option v-for="bt in bloodTypes" :key="bt" :value="bt">{{ bt }}</option>
          </select>
        </div>
      </div>

      <button id="save-patient-btn" type="submit" class="btn btn-success btn-full mt-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Confirm Patient
      </button>
    </form>

    <!-- ── Display Mode ──────────────────────────────────── -->
    <div v-else class="patient-display">
      <div class="patient-card-inner">
        <div class="patient-avatar">
          {{ store.activePatient.fullName?.charAt(0) ?? '?' }}
        </div>
        <div>
          <p class="patient-name">{{ store.activePatient.fullName }}</p>
          <p class="patient-id">ID: {{ store.activePatient.id || 'N/A' }}</p>
        </div>
      </div>

      <hr class="divider" />

      <div class="patient-meta">
        <div class="meta-item">
          <span class="meta-label">Age</span>
          <span class="meta-value">{{ store.activePatient.age || '—' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Blood Type</span>
          <span class="meta-value text-danger">{{ store.activePatient.bloodType || '—' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Status</span>
          <span class="badge" :class="store.bpmStatus.cls">
            {{ store.bpmStatus.icon }} {{ store.bpmStatus.label }}
          </span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Heart Rate</span>
          <span class="meta-value font-mono text-cyan">{{ store.currentBPM }} BPM</span>
        </div>
      </div>

      <hr class="divider" />

      <!-- Monitoring Status -->
      <div class="monitor-status" :class="store.isMonitoring ? 'active' : ''">
        <span class="live-dot" v-if="store.isMonitoring"></span>
        <span>{{ store.isMonitoring ? 'Monitoring Active — Auto-Sync ON' : 'Monitoring Stopped' }}</span>
      </div>

      <button id="edit-patient-btn" class="btn btn-ghost btn-full mt-4" @click="editPatient">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Edit Patient
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Panel ── */
.patient-panel {
  height: 100%;
}

.patient-form { display: flex; flex-direction: column; }

/* Two-column row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* ── Display Mode ── */
.patient-card-inner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.5rem;
}

.patient-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 800; color: #fff;
  flex-shrink: 0;
}

.patient-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.patient-id {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* Meta grid */
.patient-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.meta-item { display: flex; flex-direction: column; gap: 0.25rem; }

.meta-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.meta-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Monitor status bar */
.monitor-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.monitor-status.active {
  background: var(--ecg-green-dim);
  color: var(--ecg-green);
  border-color: var(--alert-normal-bd);
}
</style>
