<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps<{ modelValue: number; count: number }>()
const emit = defineEmits<{ 'update:modelValue': [n: number] }>()

const ITEM_H = 48   // px per item
const VISIBLE = 5   // items visible at once
const COPIES = 3    // list repeated 3× for seamless loop

// Middle copy index (0-based)
const MID = 1

// translateY that centers a given value (from a given copy)
function valToY(value: number, copy = MID): number {
  const centerSlot = Math.floor(VISIBLE / 2) // = 2
  return (centerSlot - (copy * props.count + value)) * ITEM_H
}

// Given current translateY, return the nearest snappable index and its value
function yToSnap(y: number): { index: number; value: number } {
  const centerSlot = Math.floor(VISIBLE / 2)
  const rawIndex = Math.round((centerSlot * ITEM_H - y) / ITEM_H)
  const total = COPIES * props.count
  // keep within bounds of repeated list
  const index = Math.max(0, Math.min(total - 1, rawIndex))
  const value = index % props.count
  return { index, value }
}

const y = ref(valToY(props.modelValue))
const snapping = ref(false)
let resetPending = false

// When parent changes value externally, move wheel
watch(() => props.modelValue, (v) => {
  if (yToSnap(y.value).value !== v) {
    snapping.value = false
    y.value = valToY(v)
  }
})

// Drag state
let startPointerY = 0
let startY = 0
let prevPointerY = 0
let prevTime = 0
let vel = 0
let raf = 0

function onPointerDown(e: PointerEvent) {
  cancelAnimationFrame(raf)
  snapping.value = false
  resetPending = false
  startPointerY = e.clientY
  startY = y.value
  prevPointerY = e.clientY
  prevTime = Date.now()
  vel = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!(e.buttons & 1)) return
  const now = Date.now()
  const dt = Math.max(1, now - prevTime)
  vel = (e.clientY - prevPointerY) / dt * 16 // px per 60fps frame
  prevPointerY = e.clientY
  prevTime = now
  y.value = startY + (e.clientY - startPointerY)
}

function snapToIndex(index: number, value: number) {
  const centerSlot = Math.floor(VISIBLE / 2)
  const targetY = (centerSlot - index) * ITEM_H
  snapping.value = true
  y.value = targetY
  emit('update:modelValue', value)
  // Silently re-center to middle copy once CSS transition finishes
  resetPending = true
  setTimeout(() => {
    if (!resetPending) return
    resetPending = false
    snapping.value = false
    y.value = valToY(value)
  }, 260)
}

function onPointerUp() {
  function coast() {
    vel *= 0.87
    y.value += vel
    if (Math.abs(vel) > 0.5) {
      raf = requestAnimationFrame(coast)
    } else {
      const { index, value } = yToSnap(y.value)
      snapToIndex(index, value)
    }
  }
  if (Math.abs(vel) > 1) {
    raf = requestAnimationFrame(coast)
  } else {
    const { index, value } = yToSnap(y.value)
    snapToIndex(index, value)
  }
}

onUnmounted(() => cancelAnimationFrame(raf))

const allItems = computed(() => {
  const base = Array.from({ length: props.count }, (_, i) => i)
  return [...base, ...base, ...base]
})

// Index of item currently at center (for opacity/size)
const centerIndex = computed(() => {
  const centerSlot = Math.floor(VISIBLE / 2)
  return Math.round((centerSlot * ITEM_H - y.value) / ITEM_H)
})
</script>

<template>
  <div
    class="relative overflow-hidden cursor-ns-resize"
    :style="{ width: '60px', height: `${ITEM_H * VISIBLE}px`, touchAction: 'none', userSelect: 'none' }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- selection highlight -->
    <div
      class="absolute inset-x-1 bg-indigo-100 rounded-xl pointer-events-none"
      :style="{ top: `${ITEM_H * 2}px`, height: `${ITEM_H}px` }"
    />

    <!-- items -->
    <div
      class="absolute inset-x-0"
      :style="{
        transform: `translateY(${y}px)`,
        transition: snapping ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        willChange: 'transform',
      }"
    >
      <div
        v-for="(item, i) in allItems"
        :key="i"
        class="flex items-center justify-center font-mono font-semibold"
        :style="{
          height: `${ITEM_H}px`,
          fontSize: Math.abs(i - centerIndex) === 0 ? '24px' : '18px',
          opacity: [1, 0.45, 0.18, 0, 0][Math.min(4, Math.abs(i - centerIndex))],
          color: Math.abs(i - centerIndex) === 0 ? '#4338ca' : '#374151',
        }"
      >
        {{ String(item).padStart(2, '0') }}
      </div>
    </div>

    <!-- fade top/bottom -->
    <div
      class="absolute inset-0 pointer-events-none z-20"
      style="background: linear-gradient(to bottom, white 0%, transparent 38%, transparent 62%, white 100%)"
    />
  </div>
</template>
