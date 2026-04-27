<script setup>
import { usePatientStore } from '../stores/patient.js'

const store = usePatientStore()

function toggleConnection() {
  store.connectionStatus = store.connectionStatus === 'Connected' ? 'Disconnected' : 'Connected'
}
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">System Settings</h1>
        <p class="page-subtitle">Configure hardware connections and system preferences.</p>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Hardware settings -->
      <div class="card p-4">
        <h3 class="font-bold mb-4 border-b pb-2 text-lg">Hardware Connection</h3>
        <div class="form-group flex justify-between items-center" style="margin-bottom:0;">
          <div>
            <label class="form-label font-bold">ESP32 ECG Sensor</label>
            <p class="text-sm text-muted">Bluetooth Low Energy connection status</p>
          </div>
          <button 
            class="btn" 
            :class="store.connectionStatus === 'Connected' ? 'btn-outline-danger' : 'btn-success'"
            @click="toggleConnection"
          >
            {{ store.connectionStatus === 'Connected' ? 'Disconnect' : 'Connect' }}
          </button>
        </div>
        <div class="mt-4">
          <span class="badge" :class="store.connectionStatus === 'Connected' ? 'badge-normal' : 'badge-danger'">
            {{ store.connectionStatus }}
          </span>
        </div>
      </div>

      <!-- Alarm thresholds -->
      <div class="card p-4">
        <h3 class="font-bold mb-4 border-b pb-2 text-lg">Clinical Alarm Thresholds</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Tachycardia Alert (BPM &gt;)</label>
            <input type="number" class="form-input" v-model.number="store.alarmSettings.tachycardia" />
          </div>
          <div class="form-group">
            <label class="form-label">Bradycardia Alert (BPM &lt;)</label>
            <input type="number" class="form-input" v-model.number="store.alarmSettings.bradycardia" />
          </div>
          <div class="form-group">
            <label class="form-label">Systolic High (mmHg &gt;)</label>
            <input type="number" class="form-input" v-model.number="store.alarmSettings.systolicHigh" />
          </div>
          <div class="form-group">
            <label class="form-label">Diastolic High (mmHg &gt;)</label>
            <input type="number" class="form-input" v-model.number="store.alarmSettings.diastolicHigh" />
          </div>
        </div>
        <p class="text-sm text-muted mt-2">Adjusting these values alters the clinical status alerts immediately.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
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
.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 800px;
}
.card { padding: 1.5rem; }
.border-b { border-bottom: 1px solid var(--border-subtle); }
.pb-2 { padding-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-4 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.text-lg { font-size: 1.1rem; }
.text-sm { font-size: 0.85rem; }
.font-bold { font-weight: 700; color: var(--text-primary); }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: 1fr 1fr; }
.gap-4 { gap: 1rem; }
</style>
