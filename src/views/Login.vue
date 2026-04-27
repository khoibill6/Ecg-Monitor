<script setup>
// ============================================================
//  views/Login.vue — Firebase Authentication Screen
//  Supports: Email/Password Login + New Account Registration
// ============================================================
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase.js'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth'

const router = useRouter()

// ── Form State ─────────────────────────────────────────────
const email     = ref('')
const password  = ref('')
const isLoading = ref(false)
const errorMsg  = ref('')
const mode      = ref('login')  // 'login' | 'register'

// ── Actions ────────────────────────────────────────────────
async function handleSubmit() {
  errorMsg.value  = ''
  isLoading.value = true

  try {
    if (mode.value === 'login') {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    } else {
      await createUserWithEmailAndPassword(auth, email.value, password.value)
    }
    router.push('/live-monitor')
  } catch (err) {
    // Map Firebase error codes to user-friendly messages
    const codes = {
      'auth/invalid-email':         'Invalid email address format.',
      'auth/user-not-found':        'No account found with this email.',
      'auth/wrong-password':        'Incorrect password. Please try again.',
      'auth/email-already-in-use':  'This email is already registered.',
      'auth/weak-password':         'Password must be at least 6 characters.',
      'auth/too-many-requests':     'Too many attempts. Account temporarily locked.',
      'auth/invalid-credential':    'Invalid credentials. Check email and password.'
    }
    errorMsg.value = codes[err.code] || `Error: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

function toggleMode() {
  mode.value    = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
}
</script>

<template>
  <div class="login-page">
    <!-- Background grid pattern -->
    <div class="bg-grid" aria-hidden="true"></div>

    <!-- Floating ECG line decoration -->
    <div class="ecg-decoration" aria-hidden="true">
      <svg viewBox="0 0 800 120" preserveAspectRatio="none">
        <polyline
          points="0,60 80,60 100,60 120,15 140,100 160,60 180,60 220,60 240,60 260,30 280,90 300,60 320,60 400,60 420,15 440,100 460,60 480,60 520,60 540,30 560,90 580,60 600,60 680,60 700,15 720,100 740,60 800,60"
          fill="none" stroke="rgba(5,150,105,0.18)" stroke-width="2.5"
        />
      </svg>
    </div>

    <!-- Login Card -->
    <div class="login-card">
      <!-- Logo / Header -->
      <div class="login-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h3l3-7 3 14 3-10 2 3h4" stroke="#00ff88" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <p class="logo-sub">VNU-IU BIOMEDICAL ENGINEERING</p>
          <h1 class="logo-title">ECG Monitor Pro</h1>
        </div>
      </div>

      <hr class="divider" />

      <!-- Mode Title -->
      <h2 class="form-title">
        {{ mode === 'login' ? 'Clinician Sign In' : 'Create Account' }}
      </h2>
      <p class="form-subtitle">
        {{ mode === 'login'
          ? 'Authorized medical personnel only'
          : 'Register a new doctor or nurse account' }}
      </p>

      <!-- Auth Form -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="login-email">Email Address</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="doctor@hospital.vn"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="error-alert" role="alert">
          <span>⚠</span> {{ errorMsg }}
        </div>

        <!-- Submit Button -->
        <button
          id="login-submit-btn"
          type="submit"
          class="btn btn-primary btn-full mt-2"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account') }}
        </button>
      </form>

      <!-- Toggle Mode -->
      <p class="toggle-text">
        {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
        <button
          id="toggle-mode-btn"
          type="button"
          class="toggle-link"
          @click="toggleMode"
        >
          {{ mode === 'login' ? 'Register here' : 'Sign in' }}
        </button>
      </p>

      <!-- Footer -->
      <p class="login-footer">
        🔒 Secured with Firebase Authentication · v2.0.0
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ── Page Layout ── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2f7;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

/* Grid background pattern */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(5,150,105,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(5,150,105,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ECG decoration SVG */
.ecg-decoration {
  position: absolute;
  bottom: 60px;
  left: 0; right: 0;
  height: 120px;
  opacity: 0.6;
}
.ecg-decoration svg { width: 100%; height: 100%; }

/* ── Card ── */
.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 2.5rem 2rem;
  box-shadow: var(--shadow-lg), 0 0 40px rgba(5,150,105,0.06);
  z-index: 1;
}

/* ── Logo ── */
.login-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: #ecfdf5;
  border: 1px solid rgba(5,150,105,0.15);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(5,150,105,0.1);
}

.logo-sub {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.logo-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
}

/* ── Form Header ── */
.divider { border: none; border-top: 1px solid var(--border-subtle); margin-bottom: 1.5rem; }

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.form-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

/* ── Auth Form ── */
.auth-form { display: flex; flex-direction: column; }

/* ── Error alert ── */
.error-alert {
  padding: 0.65rem 0.9rem;
  background: var(--alert-danger-bg);
  border: 1px solid var(--alert-danger-bd);
  border-radius: var(--radius-md);
  color: var(--alert-danger-fg);
  font-size: 0.82rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Spinner ── */
.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Toggle ── */
.toggle-text {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 1.25rem;
}

.toggle-link {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.82rem;
  padding: 0;
  margin-left: 0.3rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.toggle-link:hover { color: #047857; }

/* ── Footer ── */
.login-footer {
  text-align: center;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 1.5rem;
}
</style>
