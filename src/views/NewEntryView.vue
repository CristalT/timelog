<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEntriesStore } from '../stores/entries'
import { useSettingsStore } from '../stores/settings'
import TimeWheelPicker from '../components/TimeWheelPicker.vue'

const router = useRouter()
const entriesStore = useEntriesStore()
const settingsStore = useSettingsStore()

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function nowHour() { return new Date().getHours() }
function nowMinute() { return new Date().getMinutes() }

const date = ref(todayDate())
const inHour = ref(nowHour())
const inMinute = ref(nowMinute())
const outHour = ref(nowHour())
const outMinute = ref(nowMinute())

const saving = ref(false)
const error = ref('')

const checkIn = computed(() =>
  `${date.value}T${String(inHour.value).padStart(2, '0')}:${String(inMinute.value).padStart(2, '0')}`
)
const checkOut = computed(() =>
  `${date.value}T${String(outHour.value).padStart(2, '0')}:${String(outMinute.value).padStart(2, '0')}`
)

const hoursWorked = computed(() => {
  const diff = new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()
  return Math.max(0, diff / 3600000)
})

const amount = computed(() => hoursWorked.value * settingsStore.hourlyRate)

function fmtHours(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, '0')}m`
}

function fmtMoney(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

async function save() {
  error.value = ''
  if (new Date(checkOut.value) <= new Date(checkIn.value)) {
    error.value = 'La salida debe ser posterior al ingreso.'
    return
  }
  saving.value = true
  try {
    await entriesStore.addEntry(checkIn.value, checkOut.value)
    router.push('/')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="p-4 max-w-lg mx-auto">
    <h1 class="text-xl font-bold text-gray-900 mb-5 mt-2">Nueva entrada</h1>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      <!-- Fecha -->
      <div class="px-5 pt-5 pb-4 border-b border-gray-100">
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fecha</label>
        <input
          v-model="date"
          type="date"
          class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <!-- Horarios -->
      <div class="grid grid-cols-2 divide-x divide-gray-100">

        <!-- Ingreso -->
        <div class="px-4 py-5 flex flex-col items-center">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ingreso</span>
          <TimeWheelPicker
            :hour="inHour"
            :minute="inMinute"
            @update:hour="inHour = $event"
            @update:minute="inMinute = $event"
          />
        </div>

        <!-- Salida -->
        <div class="px-4 py-5 flex flex-col items-center">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Salida</span>
          <TimeWheelPicker
            :hour="outHour"
            :minute="outMinute"
            @update:hour="outHour = $event"
            @update:minute="outMinute = $event"
          />
        </div>

      </div>

      <!-- Preview horas/importe -->
      <div class="mx-5 mb-5">
        <div
          v-if="hoursWorked > 0"
          class="bg-indigo-50 rounded-xl px-4 py-3 flex justify-between items-center mb-4"
        >
          <span class="text-sm text-indigo-700 font-medium">{{ fmtHours(hoursWorked) }}</span>
          <span class="text-base font-bold text-indigo-700">{{ fmtMoney(amount) }}</span>
        </div>

        <p v-if="error" class="text-red-500 text-xs mb-3">{{ error }}</p>

        <button
          class="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>

    </div>
  </main>
</template>
