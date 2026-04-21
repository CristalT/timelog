import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  GoogleAuthProvider, signInWithPopup, signOut as fbSignOut,
  onAuthStateChanged, type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const ready = ref(false)

  onAuthStateChanged(auth, (u) => {
    user.value = u
    ready.value = true
  })

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)

    // Check allowlist — if the doc exists, the email must be listed
    const snap = await getDoc(doc(db, 'config', 'allowlist'))
    if (snap.exists()) {
      const emails: string[] = snap.data().emails ?? []
      if (!emails.includes(cred.user.email ?? '')) {
        await fbSignOut(auth)
        throw Object.assign(new Error(), { code: 'auth/not-allowed' })
      }
    }
  }

  async function signOut() {
    await fbSignOut(auth)
  }

  return { user, ready, signInWithGoogle, signOut }
})
