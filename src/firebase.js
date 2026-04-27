// ============================================================
//  firebase.js — Firebase v12 Initialization
//  Exports: app (default), auth, db (named)
// ============================================================
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDVo--EXzstitu9JhpORw5S0DU6jawPRPs',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'it4health-bebeiu22198.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'it4health-bebeiu22198',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'it4health-bebeiu22198.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1591535686',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:1591535686:web:fb440ef3d1307fef1d8247'
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app