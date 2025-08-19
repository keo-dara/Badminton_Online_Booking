<template>
  <div class="space-y-4">
    <div v-for="(shiftTimes, shift) in groupedTimes" :key="shift" class="time-slot-card">
      <h3 class="text-lg font-semibold mb-3">{{ shift }}</h3>
      <div class="time-slot-grid">
        <button v-for="time in shiftTimes" :key="time.id" @click="handleTimeClick(time.id!)" class="time-slot-button"
          :class="{
            'time-slot-selected': modelValue.includes(time.id!),
            'time-slot-disabled': isMaxSelected && !modelValue.includes(time.id!)
          }" :disabled="isMaxSelected && !modelValue.includes(time.id!)">
          {{ time.from }} - {{ time.to }}
        </button>
      </div>
    </div>
    <div class="text-sm" :class="isMaxSelected ? 'text-amber-500' : 'text-gray-500'">
      {{ modelValue.length }}/2 time slots selected
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Time } from '~/models';
const MAX_SELECTIONS = 2
const props = defineProps<{
  times: Time[]
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const isMaxSelected = computed(() => props.modelValue.length >= MAX_SELECTIONS)

const groupedTimes = computed(() => {
  return props.times.reduce((acc, time) => {
    const shift = time.shift || 'Other'
    if (!acc[shift]) {
      acc[shift] = []
    }
    acc[shift].push(time)
    return acc
  }, {} as Record<string, Time[]>)
})

const handleTimeClick = (timeId: number) => {
  if (props.modelValue.includes(timeId)) {
    // Always allow deselection
    emit('update:modelValue', props.modelValue.filter(id => id !== timeId))
  } else if (!isMaxSelected.value) {
    // Only allow selection if under max limit
    emit('update:modelValue', [...props.modelValue, timeId])
  }
}
</script>

<style scoped>
.time-slot-card {
  @apply p-4 rounded-lg border border-gray-200 bg-white shadow-sm;
}

.time-slot-grid {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2;
}

.time-slot-button {
  @apply px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200;
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.time-slot-button.time-slot-selected {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.time-slot-button.time-slot-disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-gray-100;
}
</style>