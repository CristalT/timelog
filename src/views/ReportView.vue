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

const copied = ref(false)

function buildReportText() {
  const label = new Date(currentYear.value, currentMonth.value - 1)
    .toLocaleString('es-AR', { month: 'long', year: 'numeric' })

  const lines = entries.value.map((e) => {
    const date = new Date(e.checkIn).toLocaleString('es-AR', { day: '2-digit', month: '2-digit' })
    const timeIn = new Date(e.checkIn).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const timeOut = new Date(e.checkOut).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const rate = fmtMoney(e.amount / e.hoursWorked)
    return `${date}  ${timeIn} → ${timeOut}  ${fmtHours(e.hoursWorked)}  ${rate}/h  ${fmtMoney(e.amount)}`
  })

  const { totalHours, totalAmount } = summary.value
  return [
    `Reporte de horas — ${label}`,
    '',
    ...lines,
    '',
    `Total: ${fmtHours(totalHours)}  |  ${fmtMoney(totalAmount)}`,
  ].join('\n')
}

async function shareReport() {
  const text = buildReportText()
  if (navigator.share) {
    await navigator.share({ text })
  } else {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <main class="p-4 max-w-lg mx-auto">
    <div class="flex items-center justify-between mb-4 mt-2">
      <h1 class="text-xl font-bold text-gray-900">Reporte mensual</h1>
      <button
        v-if="entries.length > 0"
        class="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        @click="shareReport"
      >
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span :class="copied ? 'text-green-500' : ''">{{ copied ? 'Copiado' : 'Compartir' }}</span>
      </button>
    </div>

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
