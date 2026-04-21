<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '../stores/entries'
import EntryCard from '../components/EntryCard.vue'

const entriesStore = useEntriesStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
}

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value - 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })
)

const entries = computed(() => entriesStore.entriesByMonth(currentYear.value, currentMonth.value))
const summary = computed(() => entriesStore.summaryForMonth(currentYear.value, currentMonth.value))

function fmtHours(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, '0')}m`
}

function fmtMoney(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}
</script>

<template>
  <main class="p-4 max-w-lg mx-auto">
    <h1 class="text-xl font-bold text-gray-900 mb-4 mt-2">Reporte mensual</h1>

    <div class="flex items-center justify-between mb-4">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        @click="prevMonth"
      >‹</button>
      <span class="text-sm font-semibold text-gray-800 capitalize">{{ monthLabel }}</span>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        @click="nextMonth"
      >›</button>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-5">
      <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
        <p class="text-xs text-gray-400">Horas</p>
        <p class="text-xl font-bold text-indigo-600">{{ fmtHours(summary.totalHours) }}</p>
      </div>
      <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
        <p class="text-xs text-gray-400">Total</p>
        <p class="text-xl font-bold text-green-600">{{ fmtMoney(summary.totalAmount) }}</p>
      </div>
    </div>

    <div v-if="entries.length === 0" class="text-center text-sm text-gray-400 py-12">
      Sin entradas en este mes
    </div>

    <div v-else class="space-y-3">
      <EntryCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        @delete="entriesStore.deleteEntry($event)"
      />
    </div>
  </main>
</template>
