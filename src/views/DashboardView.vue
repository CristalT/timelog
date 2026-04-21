<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEntriesStore } from '../stores/entries'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const entriesStore = useEntriesStore()
const settingsStore = useSettingsStore()

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

const summary = computed(() => entriesStore.summaryForMonth(year, month))

const monthName = new Date(year, month - 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })

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
    <h1 class="text-xl font-bold text-gray-900 mb-1 mt-2">Timelog</h1>
    <p class="text-sm text-gray-500 mb-6 capitalize">{{ monthName }}</p>

    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-400 mb-1">Horas trabajadas</p>
        <p class="text-2xl font-bold text-indigo-600">{{ fmtHours(summary.totalHours) }}</p>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-400 mb-1">Total a cobrar</p>
        <p class="text-2xl font-bold text-green-600">{{ fmtMoney(summary.totalAmount) }}</p>
      </div>
    </div>

    <div class="bg-indigo-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
      <span class="text-sm text-indigo-700">Valor hora: <strong>{{ fmtMoney(settingsStore.hourlyRate) }}</strong></span>
      <button class="text-xs text-indigo-600 underline" @click="router.push('/settings')">Cambiar</button>
    </div>

    <button
      class="w-full bg-indigo-600 text-white rounded-2xl py-4 font-semibold text-base hover:bg-indigo-700 active:scale-95 transition-all"
      @click="router.push('/new')"
    >
      + Nueva entrada
    </button>
  </main>
</template>
