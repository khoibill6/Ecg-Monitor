// ============================================================
//  stores/patient.js — Pinia Store
//  Manages: auth user, active patient, ECG buffer, history,
//           vital signs, clinical status, alerts, sessions
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth } from '../firebase.js'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp,
  doc, updateDoc
} from 'firebase/firestore'

export const usePatientStore = defineStore('patient', () => {
  // ── State ──────────────────────────────────────────────
  const currentUser   = ref(null)             // Firebase Auth user object
  const activePatient = ref({                 // Patient demographics
    id:        '',
    fullName:  '',
    age:       '',
    gender:    '',
    bloodType: ''
  })
  const patientsList  = ref([                 // Directory of patients
    { id: 'P001', fullName: 'Nguyen Van A', age: 45, gender: 'Male', bloodType: 'O+' },
    { id: 'P002', fullName: 'Tran Thi B', age: 62, gender: 'Female', bloodType: 'A+' },
    { id: 'P003', fullName: 'Le Van C', age: 38, gender: 'Male', bloodType: 'B-' }
  ])
  const alarmSettings = ref({                 // Configurable alarm thresholds
    tachycardia: 100,
    bradycardia: 60,
    systolicHigh: 140,
    diastolicHigh: 90
  })
  const currentBPM    = ref(72)               // Live BPM reading
  const systolicBP    = ref(120)              // Systolic blood pressure
  const diastolicBP   = ref(80)              // Diastolic blood pressure
  const sessionNote   = ref('')               // Optional note
  const sessions      = ref([])               // Historical Firestore records
  const isMonitoring  = ref(false)            // Is ECG actively recording?
  const unsubscribe   = ref(null)             // Firestore listener cleanup fn
  const connectionStatus = ref('Connected')   // BLE / connection status
  const startTime     = ref(null)             // Session start time
  const sessionDuration = ref(0)              // Duration in seconds
  const currentSessionId = ref(null)          // Tracks active firestore doc ID
  let durationInterval = null

  // ── Getters ────────────────────────────────────────────
  const bpmStatus = computed(() => {
    const bpm = currentBPM.value
    const { tachycardia, bradycardia } = alarmSettings.value
    if (bpm > tachycardia) return { label: 'TACHYCARDIA',  cls: 'badge-danger',  icon: '⚠' }
    if (bpm < bradycardia) return { label: 'BRADYCARDIA',  cls: 'badge-warning', icon: '⚡' }
    return               { label: 'NORMAL SINUS',   cls: 'badge-normal',  icon: '✓' }
  })

  const hasPatient = computed(() => !!activePatient.value.fullName)

  // ── Clinical Status (computed based on vitals) ─────────
  const clinicalStatus = computed(() => {
    const bpm = currentBPM.value
    const sys = systolicBP.value
    const dia = diastolicBP.value
    const { tachycardia, bradycardia, systolicHigh, diastolicHigh } = alarmSettings.value

    // Critical: abnormal HR
    if (bpm > tachycardia + 30 || bpm < bradycardia - 15) {
      return {
        level: 'CRITICAL',
        color: 'danger',
        reason: bpm > tachycardia + 30 ? 'Severe tachycardia detected' : 'Severe bradycardia detected'
      }
    }
    // Review: elevated BP or moderate HR anomaly
    if (sys > systolicHigh || dia > diastolicHigh || bpm > tachycardia || bpm < bradycardia - 5) {
      return {
        level: 'REVIEW NEEDED',
        color: 'warning',
        reason: sys > systolicHigh ? 'Elevated blood pressure' : bpm > tachycardia ? 'Elevated heart rate' : 'Low heart rate'
      }
    }
    return {
      level: 'NORMAL',
      color: 'normal',
      reason: 'All vitals within normal range'
    }
  })

  // ── Priority Alerts (mock + computed) ──────────────────
  const priorityAlerts = computed(() => {
    const alerts = []
    if (currentBPM.value > 120) {
      alerts.push({
        id: 1,
        level: 'critical',
        badge: 'badge-danger',
        title: 'Critical Alert',
        detail: `HR ${currentBPM.value} BPM — Tachycardia`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      })
    }
    if (systolicBP.value > 140) {
      alerts.push({
        id: 2,
        level: 'review',
        badge: 'badge-warning',
        title: 'Review Needed',
        detail: `BP trending up: ${systolicBP.value}/${diastolicBP.value} mmHg`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      })
    }
    // Always show a follow-up alert as baseline
    alerts.push({
      id: 3,
      level: 'followup',
      badge: 'badge-purple',
      title: 'Follow-up Required',
      detail: 'Routine cardiac rhythm review scheduled',
      time: '09:00:00 AM'
    })
    return alerts.slice(0, 3)
  })

  // ── Formatted duration ─────────────────────────────────
  const formattedDuration = computed(() => {
    const s = sessionDuration.value
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  })

  const formattedStartTime = computed(() => {
    if (!startTime.value) return '--:--:-- --'
    return startTime.value.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  })

  // ── Actions ────────────────────────────────────────────

  /** Set the logged-in Firebase user */
  function setUser(user) {
    currentUser.value = user
  }

  /** Update active patient demographics */
  function setPatient(data) {
    activePatient.value = { ...activePatient.value, ...data }
  }

  /** Select patient from directory for monitoring */
  function selectPatientForMonitoring(id) {
    const p = patientsList.value.find(x => x.id === id)
    if (p) {
      setPatient(p)
    }
  }

  /** Add new patient to directory */
  function addPatient(patient) {
    const newId = `P${String(patientsList.value.length + 1).padStart(3, '0')}`
    patientsList.value.push({ id: newId, ...patient })
  }

  /** Update live BPM */
  function setBPM(bpm) {
    currentBPM.value = bpm
  }

  /** Start monitoring session with Auto-Save tracking */
  async function startSession() {
    isMonitoring.value = true
    startTime.value = new Date()
    sessionDuration.value = 0
    currentSessionId.value = null
    
    // Create new session doc in Firestore
    if (activePatient.value.fullName && auth.currentUser) {
      try {
        const clinicianId = auth.currentUser.uid
        const sessionsRef = collection(db, 'clinicians', clinicianId, 'ecg_sessions')
        
        const docRef = await addDoc(sessionsRef, {
          patientId:   activePatient.value.id   || 'UNKNOWN',
          patientName: activePatient.value.fullName,
          age:         activePatient.value.age  || 0,
          gender:      activePatient.value.gender || 'N/A',
          bloodType:   activePatient.value.bloodType || 'N/A',
          bpm:         currentBPM.value,
          systolicBP:  systolicBP.value,
          diastolicBP: diastolicBP.value,
          note:        sessionNote.value,
          duration:    0,
          timestamp:   serverTimestamp()
        })
        currentSessionId.value = docRef.id
      } catch (err) {
        console.error('[Store] startSession error:', err)
      }
    }

    durationInterval = setInterval(async () => {
      sessionDuration.value++
      
      // Auto-save every 5 seconds
      if (sessionDuration.value % 5 === 0 && currentSessionId.value && auth.currentUser) {
        try {
          const clinicianId = auth.currentUser.uid
          const docRef = doc(db, 'clinicians', clinicianId, 'ecg_sessions', currentSessionId.value)
          await updateDoc(docRef, {
            bpm:         currentBPM.value,
            systolicBP:  systolicBP.value,
            diastolicBP: diastolicBP.value,
            note:        sessionNote.value,
            duration:    sessionDuration.value
          })
        } catch (err) {
          console.error('[Store] auto-update error:', err)
        }
      }
    }, 1000)
  }

  /** Stop monitoring session and save final state */
  async function stopSession() {
    isMonitoring.value = false
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
    // Final save
    if (currentSessionId.value && auth.currentUser) {
      try {
        const clinicianId = auth.currentUser.uid
        const docRef = doc(db, 'clinicians', clinicianId, 'ecg_sessions', currentSessionId.value)
        await updateDoc(docRef, {
          bpm:         currentBPM.value,
          systolicBP:  systolicBP.value,
          diastolicBP: diastolicBP.value,
          note:        sessionNote.value,
          duration:    sessionDuration.value
        })
      } catch (err) {}
      currentSessionId.value = null
    }
  }

  /** Clear vital sign inputs */
  function clearInputs() {
    currentBPM.value = 72
    systolicBP.value = 120
    diastolicBP.value = 80
    sessionNote.value = ''
  }



  /**
   * Start listening to Firestore ecg_sessions in real-time.
   * Ordered by timestamp desc, limited to 100 records.
   */
  function subscribeToHistory() {
    if (unsubscribe.value) return // already listening
    if (!auth.currentUser) return // require auth context

    const clinicianId = auth.currentUser.uid
    const sessionsRef = collection(db, 'clinicians', clinicianId, 'ecg_sessions')

    const q = query(
      sessionsRef,
      orderBy('timestamp', 'desc'),
      limit(100)
    )

    unsubscribe.value = onSnapshot(q, (snap) => {
      sessions.value = snap.docs.map(doc => ({
        id:          doc.id,
        patientId:   doc.data().patientId,
        patientName: doc.data().patientName,
        age:         doc.data().age,
        gender:      doc.data().gender,
        bloodType:   doc.data().bloodType,
        bpm:         doc.data().bpm,
        systolicBP:  doc.data().systolicBP || null,
        diastolicBP: doc.data().diastolicBP || null,
        note:        doc.data().note || '',
        duration:    doc.data().duration || 0,
        timestamp:   doc.data().timestamp?.toDate() ?? new Date()
      }))
    }, err => {
      console.error('[Store] Firestore snapshot error:', err)
    })
  }

  /** Stop Firestore listener */
  function unsubscribeHistory() {
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = null
    }
  }

  return {
    // State
    currentUser, activePatient, patientsList, currentBPM, systolicBP, diastolicBP,
    sessionNote, sessions, isMonitoring, connectionStatus, alarmSettings,
    startTime, sessionDuration,
    // Getters
    bpmStatus, hasPatient, clinicalStatus, priorityAlerts,
    formattedDuration, formattedStartTime,
    // Actions
    setUser, setPatient, selectPatientForMonitoring, addPatient, setBPM,
    startSession, stopSession, clearInputs,
    subscribeToHistory, unsubscribeHistory
  }
})

