<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="needRefresh"
      class="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div class="bg-gray-900 text-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-4 w-full max-w-sm">
        <div class="flex-1">
          <p class="text-sm font-medium">Nueva versión disponible</p>
          <p class="text-xs text-gray-400 mt-0.5">Actualizá para ver los últimos cambios.</p>
        </div>
        <button
          class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
          @click="updateServiceWorker()"
        >
          Actualizar
        </button>
      </div>
    </div>
  </Teleport>
</template>
