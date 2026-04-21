import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, doc, addDoc, deleteDoc,
  onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useSettingsStore } from './settings'

const FAMILY_ID = import.meta.env.VITE_FAMILY_ID as string

export interface WorkEntry {
  id: string
  checkIn: string
  checkOut: string
  hoursWorked: number
  amount: number
}

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<WorkEntry[]>([])
  let unsubscribe: (() => void) | null = null

  function listen() {
    if (unsubscribe) unsubscribe()
    const q = query(
      collection(db, 'families', FAMILY_ID, 'entries'),
      orderBy('checkIn', 'desc'),
    )
    unsubscribe = onSnapshot(q, (snap) => {
      entries.value = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          checkIn: (data.checkIn as Timestamp).toDate().toISOString(),
          checkOut: (data.checkOut as Timestamp).toDate().toISOString(),
          hoursWorked: data.hoursWorked,
          amount: data.amount,
        }
      })
    })
  }

  async function addEntry(checkIn: string, checkOut: string) {
    const settingsStore = useSettingsStore()
    const inDate = new Date(checkIn)
    const outDate = new Date(checkOut)
    const hoursWorked = Math.max(0, (outDate.getTime() - inDate.getTime()) / 3600000)
    const amount = hoursWorked * settingsStore.hourlyRate
    await addDoc(collection(db, 'families', FAMILY_ID, 'entries'), {
      checkIn: Timestamp.fromDate(inDate),
      checkOut: Timestamp.fromDate(outDate),
      hoursWorked,
      amount,
    })
  }

  async function deleteEntry(id: string) {
    await deleteDoc(doc(db, 'families', FAMILY_ID, 'entries', id))
  }

  function entriesByMonth(year: number, month: number): WorkEntry[] {
    return entries.value.filter((e) => {
      const d = new Date(e.checkIn)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }

  function summaryForMonth(year: number, month: number) {
    const list = entriesByMonth(year, month)
    const totalHours = list.reduce((s, e) => s + e.hoursWorked, 0)
    const totalAmount = list.reduce((s, e) => s + e.amount, 0)
    return { totalHours, totalAmount }
  }

  return { entries, listen, addEntry, deleteEntry, entriesByMonth, summaryForMonth }
})
