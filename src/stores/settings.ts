import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const FAMILY_ID = import.meta.env.VITE_FAMILY_ID as string

export const useSettingsStore = defineStore('settings', () => {
  const hourlyRate = ref(0)

  async function load() {
    const snap = await getDoc(doc(db, 'families', FAMILY_ID, 'settings', 'config'))
    if (snap.exists()) {
      hourlyRate.value = snap.data().hourlyRate ?? 0
    }
  }

  async function setHourlyRate(value: number) {
    hourlyRate.value = value
    await setDoc(doc(db, 'families', FAMILY_ID, 'settings', 'config'), { hourlyRate: value })
  }

  return { hourlyRate, load, setHourlyRate }
})
