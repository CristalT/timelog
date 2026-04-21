<script setup lang="ts">
import WheelColumn from './WheelColumn.vue'

const props = defineProps<{ hour: number; minute: number }>()
const emit = defineEmits<{
  'update:hour': [n: number]
  'update:minute': [n: number]
}>()
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <WheelColumn
      :model-value="props.hour"
      :count="24"
      @update:model-value="emit('update:hour', $event)"
    />
    <span class="text-2xl font-bold text-gray-400 mb-1 select-none">:</span>
    <WheelColumn
      :model-value="props.minute"
      :count="60"
      @update:model-value="emit('update:minute', $event)"
    />
  </div>
</template>
