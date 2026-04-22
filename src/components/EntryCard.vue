<script setup lang="ts">
import { ref } from 'vue'
import type { WorkEntry } from '../stores/entries'

defineProps<{ entry: WorkEntry }>()
const emit = defineEmits<{ delete: [id: string] }>()

const showConfirm = ref(false)

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

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
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-3">
    <div class="flex-1 min-w-0">
      <p class="text-xs font-medium text-gray-500 mb-2">{{ fmtDate(entry.checkIn) }}</p>
      <div class="flex items-center gap-3">
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Ingreso</p>
          <p class="text-sm font-medium text-gray-800">{{ fmtTime(entry.checkIn) }}</p>
        </div>
        <span class="text-gray-300 text-sm">→</span>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Salida</p>
          <p class="text-sm font-medium text-gray-800">{{ fmtTime(entry.checkOut) }}</p>
        </div>
      </div>
    </div>
    <div class="text-right shrink-0">
      <p class="text-lg font-bold text-indigo-600">{{ fmtHours(entry.hoursWorked) }}</p>
      <p class="text-sm font-semibold text-green-600">{{ fmtMoney(entry.amount) }}</p>
      <p class="text-xs text-gray-400 mt-0.5">{{ fmtMoney(entry.amount / entry.hoursWorked) }}/h</p>
      <button
        class="mt-3 text-red-300 hover:text-red-500 transition-colors"
        @click="showConfirm = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Modal de confirmación -->
  <Teleport to="body">
    <div
      v-if="showConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showConfirm = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4">
        <h3 class="text-base font-semibold text-gray-800 mb-2">¿Eliminar entrada?</h3>
        <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex gap-3 justify-end">
          <button
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            @click="showConfirm = false"
          >
            Cancelar
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            @click="emit('delete', entry.id); showConfirm = false"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
