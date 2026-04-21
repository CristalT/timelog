<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const rate = ref(settingsStore.hourlyRate)
const saved = ref(false)

onMounted(() => { rate.value = settingsStore.hourlyRate })

async function save() {
  await settingsStore.setHourlyRate(Number(rate.value))
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <main class="p-4 max-w-lg mx-auto">
    <h1 class="text-xl font-bold text-gray-900 mb-6 mt-2">Ajustes</h1>

    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <label class="block text-sm font-medium text-gray-700 mb-2">Valor hora</label>
      <div class="flex items-center gap-2">
        <span class="text-gray-500 text-sm">$</span>
        <input
          v-model="rate"
          type="number"
          min="0"
          step="0.01"
          class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <button
        class="mt-4 w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all"
        @click="save"
      >
        {{ saved ? '✓ Guardado' : 'Guardar' }}
      </button>
    </div>
  </main>
</template>
