<script setup>
import { computed } from 'vue'
import { usePatientStore } from '../stores/patient.js'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js'

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale, Filler
)

const store = usePatientStore()

const totalPatients = computed(() => store.patientsList.length)
const totalSessions = computed(() => store.sessions.length)
const warningCount = computed(() => {
  const { tachycardia, bradycardia } = store.alarmSettings
  return store.sessions.filter(s => s.bpm > tachycardia || s.bpm < bradycardia).length
})

const alertPercentage = computed(() => {
  if (totalSessions.value === 0) return 0
  return Math.round((warningCount.value / totalSessions.value) * 100)
})

const chartDataBPM = computed(() => {
  // Use a copy to avoid mutating the store array, and reverse for chronological order
  const ascendingSessions = [...store.sessions].reverse().slice(-50) // last 50 for performance
  return {
    labels: ascendingSessions.map(s => {
      const d = s.timestamp
      if (!d) return ''
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }),
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: ascendingSessions.map(s => s.bpm),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
        pointRadius: 3,
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const chartDataBP = computed(() => {
  const ascendingSessions = [...store.sessions].reverse().slice(-50)
  return {
    labels: ascendingSessions.map(s => {
      const d = s.timestamp
      if (!d) return ''
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }),
    datasets: [
      {
        label: 'Systolic BP (mmHg)',
        data: ascendingSessions.map(s => s.systolicBP || 120),
        borderColor: '#dc2626',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointBackgroundColor: '#dc2626',
        pointRadius: 3,
        tension: 0.4
      },
      {
        label: 'Diastolic BP (mmHg)',
        data: ascendingSessions.map(s => s.diastolicBP || 80),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 3,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { family: 'inherit', size: 12 },
        usePointStyle: true,
        boxWidth: 8
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { size: 13, family: 'inherit' },
      bodyFont: { size: 13, family: 'inherit' },
      padding: 10,
      cornerRadius: 6,
      usePointStyle: true
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
      ticks: { font: { family: 'inherit' } }
    },
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { 
        font: { family: 'inherit' },
        maxTicksLimit: 8
      }
    }
  }
}

function exportPDF() {
  window.print()
}
</script>

<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Analytics & Reports</h1>
        <p class="page-subtitle">Overview of clinical sessions and system utilization.</p>
      </div>
      <button class="btn btn-primary" @click="exportPDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="icon-left">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Export Report
      </button>
    </div>

    <!-- Overview Stats -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon bg-primary-dim text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Patients</span>
          <span class="stat-value text-primary-color">{{ totalPatients }}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total ECG Sessions</span>
          <span class="stat-value text-success">{{ totalSessions }}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background: rgba(220,38,38,0.1); color: #dc2626;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Critical Cardiac Events</span>
          <span class="stat-value text-danger">{{ warningCount }}</span>
        </div>
      </div>
    </div>

    <!-- Details block (Mock) -->
    <div class="card p-4 mt-4">
      <div class="card-header border-b-0 pb-4">
        <span>Anomaly Frequency</span>
        <span class="badge badge-warning">{{ alertPercentage }}% Warning Rate</span>
      </div>
      
      <div class="mock-chart">
        <div class="chart-bar-container">
          <div class="chart-bar" :style="{ width: alertPercentage + '%' }" style="background: #dc2626;"></div>
          <div class="chart-bar" :style="{ width: (100 - alertPercentage) + '%' }" style="background: #10b981;"></div>
        </div>
        <div class="chart-legend">
          <span><span class="legend-dot" style="background: #dc2626;"></span> Anomalous ({{ warningCount }})</span>
          <span><span class="legend-dot" style="background: #10b981;"></span> Normal ({{ totalSessions - warningCount }})</span>
        </div>
      </div>
    </div>
    
    <!-- Advanced Analytical Charts -->
    <div class="charts-grid mt-4">
      <!-- Heart Rate Trend -->
      <div class="card p-4">
        <div class="card-header border-b-0 pb-4">
          <span>Heart Rate Trend (Last 50 Sessions)</span>
        </div>
        <div class="chart-container">
          <Line :data="chartDataBPM" :options="chartOptions" v-if="totalSessions > 0" />
          <div v-else class="empty-chart">Tracking data will appear here.</div>
        </div>
      </div>

      <!-- Blood Pressure Trend -->
      <div class="card p-4">
        <div class="card-header border-b-0 pb-4">
          <span>Blood Pressure Trend (Last 50 Sessions)</span>
        </div>
        <div class="chart-container">
          <Line :data="chartDataBP" :options="chartOptions" v-if="totalSessions > 0" />
           <div v-else class="empty-chart">Tracking data will appear here.</div>
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 56px; height: 56px;
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

/* Mock Chart */
.mock-chart {
  padding: 1rem 0;
}

.chart-bar-container {
  height: 24px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  margin-bottom: 1rem;
}

.chart-bar {
  height: 100%;
  transition: width 0.5s ease;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.legend-dot {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  margin-right: 0.4rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.empty-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: var(--bg-body);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-subtle);
}

@media (max-width: 1024px) {
  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
