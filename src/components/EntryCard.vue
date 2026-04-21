<script setup lang="ts">
import { ref } from 'vue'
import type { WorkEntry } from '../stores/entries'

defineProps<{ entry: WorkEntry }>()
const emit = defineEmits<{ delete: [id: string] }>()

const showConfirm = ref(false)

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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
      <p class="text-xs text-gray-400 mb-1">Ingreso</p>
      <p class="text-sm font-medium text-gray-800">{{ fmt(entry.checkIn) }}</p>
      <p class="text-xs text-gray-400 mt-2 mb-1">Salida</p>
      <p class="text-sm font-medium text-gray-800">{{ fmt(entry.checkOut) }}</p>
    </div>
    <div class="text-right shrink-0">
      <p class="text-lg font-bold text-indigo-600">{{ fmtHours(entry.hoursWorked) }}</p>
      <p class="text-sm font-semibold text-green-600">{{ fmtMoney(entry.amount) }}</p>
      <button
        class="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
        @click="showConfirm = true"
      >
        Eliminar
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
