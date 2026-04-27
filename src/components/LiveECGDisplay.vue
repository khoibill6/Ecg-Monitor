<script setup>
// ============================================================
//  LiveECGDisplay.vue — Real-Time ECG Waveform (HTML5 Canvas)
//  Simulates a PQRST complex using mathematical functions.
//  Updated for Light Medical Theme.
// ============================================================
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { usePatientStore } from '../stores/patient.js'

const store  = usePatientStore()
const canvas = ref(null)

// ── Configuration ────────────────────────────────────────
const CANVAS_WIDTH  = 800
const CANVAS_HEIGHT = 250
const SAMPLE_RATE   = 100       // ms between samples
const MAX_POINTS    = 400       // visible data points on screen
const LINE_COLOR    = '#059669' // Medical green
const GRID_COLOR    = 'rgba(5,150,105,0.08)'
const BG_COLOR      = '#ffffff'

// ── ECG Data Buffer ──────────────────────────────────────
const ecgBuffer = ref([])
let sampleIndex = 0
let animFrameId = null
let intervalId  = null



// ── PQRST Waveform Generator ────────────────────────────
// Generates a single ECG cycle value at position `t` (0..1)
// using a combination of Gaussian peaks for P, Q, R, S, T waves
function pqrstWave(t) {
  // Gaussian peak helper: amplitude * exp(-((t - center)^2) / (2 * width^2))
  const gauss = (amp, center, width) =>
    amp * Math.exp(-Math.pow(t - center, 2) / (2 * width * width))

  // P wave:   small positive bump
  const P = gauss(0.12, 0.15, 0.035)
  // Q wave:   small negative dip before R
  const Q = gauss(-0.08, 0.28, 0.012)
  // R wave:   tall sharp positive spike (main QRS complex)
  const R = gauss(0.85, 0.32, 0.018)
  // S wave:   negative dip after R
  const S = gauss(-0.18, 0.36, 0.015)
  // T wave:   broad positive bump (repolarization)
  const T = gauss(0.22, 0.55, 0.055)
  // U wave:   very subtle bump after T (sometimes visible)
  const U = gauss(0.03, 0.72, 0.04)

  return P + Q + R + S + T + U
}

// Generate one sample at the current index
function generateSample() {
  const heartRate     = store.currentBPM
  const cycleLength   = Math.round(600 / (heartRate / 72)) // samples per beat
  const t             = (sampleIndex % cycleLength) / cycleLength

  // Add slight noise for realism
  const noise = (Math.random() - 0.5) * 0.015
  const value = pqrstWave(t) + noise

  ecgBuffer.value.push(value)
  if (ecgBuffer.value.length > MAX_POINTS) {
    ecgBuffer.value.shift()
  }

  sampleIndex++
}

// ── Canvas Drawing ───────────────────────────────────────
function drawECG() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  const w = canvas.value.width
  const h = canvas.value.height

  // Clear background
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, w, h)

  // Draw background grid
  drawGrid(ctx, w, h)

  // Draw the ECG trace
  const data = ecgBuffer.value
  if (data.length < 2) return

  const stepX    = w / MAX_POINTS
  const centerY  = h * 0.55  // baseline slightly below center
  const scaleY   = h * 0.4   // amplitude scaling

  // Main line
  ctx.beginPath()
  ctx.strokeStyle = LINE_COLOR
  ctx.lineWidth   = 2.5
  ctx.lineJoin    = 'round'
  ctx.lineCap     = 'round'

  for (let i = 0; i < data.length; i++) {
    const x = i * stepX
    const y = centerY - data[i] * scaleY
    if (i === 0) ctx.moveTo(x, y)
    else         ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Glow effect (same path, wider, semi-transparent)
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(5,150,105,0.12)'
  ctx.lineWidth   = 8
  ctx.lineJoin    = 'round'
  for (let i = 0; i < data.length; i++) {
    const x = i * stepX
    const y = centerY - data[i] * scaleY
    if (i === 0) ctx.moveTo(x, y)
    else         ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Moving scan-head dot at the end of the trace
  if (data.length > 0) {
    const lastX = (data.length - 1) * stepX
    const lastY = centerY - data[data.length - 1] * scaleY
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#059669'
    ctx.fill()
    // Glow around dot
    ctx.beginPath()
    ctx.arc(lastX, lastY, 10, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(5,150,105,0.15)'
    ctx.fill()
  }
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth   = 0.5

  // Vertical lines
  const gridSpacing = 40
  for (let x = 0; x < w; x += gridSpacing) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  // Horizontal lines
  for (let y = 0; y < h; y += gridSpacing) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}

// ── Animation Loop ───────────────────────────────────────
function renderLoop() {
  drawECG()
  animFrameId = requestAnimationFrame(renderLoop)
}

// ── BPM Status (computed) ────────────────────────────────
const bpmClass = computed(() => store.bpmStatus.cls)
const bpmLabel = computed(() => store.bpmStatus.label)
const bpmIcon  = computed(() => store.bpmStatus.icon)

// ── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  // Set canvas actual pixel size (for sharp rendering)
  if (canvas.value) {
    canvas.value.width  = CANVAS_WIDTH
    canvas.value.height = CANVAS_HEIGHT
  }

  // Generate samples at fixed interval
  intervalId = setInterval(generateSample, SAMPLE_RATE)

  // Start rendering
  renderLoop()
})

onUnmounted(() => {
  if (intervalId)  clearInterval(intervalId)
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<template>
  <div class="ecg-panel">
    <!-- Controls row -->
    <div class="ecg-controls">

      <div class="ecg-live-indicator">
        <span class="live-dot"></span>
        <span class="ecg-live-text">LIVE</span>
      </div>
    </div>

    <!-- Canvas ECG Display -->
    <div class="ecg-canvas-wrap">
      <canvas ref="canvas" class="ecg-canvas"></canvas>

      <!-- BPM Overlay (top-right of canvas) -->
      <div class="bpm-overlay">
        <div class="bpm-number" :class="bpmClass">
          {{ store.currentBPM }}
        </div>
        <div class="bpm-unit">BPM</div>
        <div class="badge" :class="bpmClass">
          {{ bpmIcon }} {{ bpmLabel }}
        </div>
      </div>
    </div>

    <!-- Bottom info bar -->
    <div class="ecg-info-bar">
      <span class="ecg-info-item">Gain: 10 mm/mV</span>
      <span class="ecg-info-item">Speed: 25 mm/s</span>
      <span class="ecg-info-item">Filter: 0.05–150 Hz</span>
      <span class="ecg-info-item font-mono text-primary-color">
        Samples: {{ ecgBuffer.length }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* ── Panel ── */
.ecg-panel { overflow: hidden; }

.ecg-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.ecg-control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}



.ecg-live-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ecg-live-text {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 1px;
}

/* ── Canvas ── */
.ecg-canvas-wrap {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
}

.ecg-canvas {
  display: block;
  width: 100%;
  height: 250px;
  image-rendering: auto;
}

/* ── BPM Overlay ── */
.bpm-overlay {
  position: absolute;
  top: 12px;
  right: 16px;
  text-align: right;
}

.bpm-number {
  font-family: var(--font-mono);
  font-size: 2.75rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 0.15rem;
}

.bpm-number.badge-normal  { color: var(--alert-normal-fg); }
.bpm-number.badge-danger  { color: var(--alert-danger-fg); animation: bpm-pulse-red 0.8s infinite; }
.bpm-number.badge-warning { color: var(--alert-warning-fg); }

@keyframes bpm-pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}

.bpm-unit {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

/* ── Info Bar ── */
.ecg-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 0.55rem 1.25rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-panel);
}

.ecg-info-item { white-space: nowrap; font-weight: 500; }
</style>

