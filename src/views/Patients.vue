<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '../stores/patient.js'

const store = usePatientStore()
const router = useRouter()

const showAddModal = ref(false)
const newPatient = ref({ fullName: '', age: 40, gender: 'Male', bloodType: 'A+' })

function startMonitoring(id) {
  store.selectPatientForMonitoring(id)
  router.push('/live-monitor')
}

function saveNewPatient() {
  if (!newPatient.value.fullName) return
  store.addPatient({ ...newPatient.value })
  showAddModal.value = false
  newPatient.value = { fullName: '', age: 40, gender: 'Male', bloodType: 'A+' }
}
</script>

<template>
  <div class="patients-page">
    
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Patient Directory</h1>
        <p class="page-subtitle">Manage patient records and initiate monitoring sessions.</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Add Patient
      </button>
    </div>

    <!-- Patient Grid -->
    <div class="patient-grid">
      <div v-for="p in store.patientsList" :key="p.id" class="card patient-card">
        <div class="pc-header">
          <div class="pc-avatar">{{ p.fullName.charAt(0) }}</div>
          <div class="pc-info">
            <h3 class="pc-name">{{ p.fullName }}</h3>
            <span class="pc-id font-mono">{{ p.id }}</span>
          </div>
        </div>
        <div class="pc-body">
          <div class="pc-stat">
            <span class="pc-stat-label">Age</span>
            <span class="pc-stat-val">{{ p.age }}</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-label">Gender</span>
            <span class="pc-stat-val">{{ p.gender }}</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-label">Blood</span>
            <span class="pc-stat-val text-danger">{{ p.bloodType }}</span>
          </div>
        </div>
        <div class="pc-footer">
          <button class="btn btn-outline-success btn-full" @click="startMonitoring(p.id)">
            Start Monitoring
          </button>
        </div>
      </div>
    </div>

    <!-- Add Patient Modal (Mock) -->
    <div class="modal-overlay" v-if="showAddModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Add New Patient</h3>
          <button class="modal-close" @click="showAddModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" v-model="newPatient.fullName" placeholder="e.g. Nguyen Van D" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Age</label>
              <input type="number" class="form-input" v-model.number="newPatient.age" />
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select class="form-select" v-model="newPatient.gender">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Blood Type</label>
            <select class="form-select" v-model="newPatient.bloodType">
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option>
              <option>AB+</option><option>AB-</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showAddModal = false">Cancel</button>
          <button class="btn btn-primary" @click="saveNewPatient">Save</button>
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

.patient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.patient-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.pc-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.pc-avatar {
  width: 48px; height: 48px;
  background: var(--primary-dim);
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 800;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.pc-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.pc-id {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pc-body {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.25rem;
}

.pc-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pc-stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.pc-stat-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: var(--bg-surface);
  width: 100%;
  max-width: 450px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-close:hover { color: var(--text-primary); }

.modal-body { padding: 1.5rem; }
.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
