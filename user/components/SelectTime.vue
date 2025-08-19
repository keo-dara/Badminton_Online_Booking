<template>
  <div v-for="(section, index) in sections">
    <div v-if="sections.length" class="mt-2 pb-1 text-gray-500">
      {{ titles[index] }}
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div v-for="(time, index) in section" :id="time.id.toString()" class="time-chip" :class="[
        time.isDisable
          ? 'time-booked'
          : 'time-normal',
        isSelected(time) ? 'time-selected' : 'time-normal'
      ]" @click="() =>
        time.isDisable
          ? null
          : onSelectTimeSlot(time)
        ">
        {{ time.displayTime  }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Availability } from '~/models/availability';
import type { Time } from '~/models/time';
import { useCourtStore } from '~/store/court';

const courtStore = useCourtStore();
const selectedTimes = defineModel<Availability[]>();
const titles = ['Morning', 'Afternoon', 'Evening'];

const props = defineProps<{ selectedDate: Date }>();

function isSelected(time: Availability) {
  return selectedTimes.value?.some(obj => obj.id == time.id);
}

function onSelectTimeSlot(time: Availability) {
  const index = selectedTimes.value?.findIndex(e => e.id == time.id) ?? -1;

  if (index != -1) {
    selectedTimes.value?.splice(index, 1);
  } else if (selectedTimes.value?.length == 0) {
    selectedTimes.value?.push(time);
  } else if (selectedTimes.value?.length == 1) {
    selectedTimes.value?.push(time);
  } else {
    selectedTimes.value = [time];
  }
}

const sections = computed(() => {
  const availability = (courtStore.courtDetail?.availability ?? []).filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id)
  );

  const morning = availability
    .filter(av => av.time.shift == 'morning')
    .sort((a, b) => a.time.to - b.time.to);

  const afternoon = availability
    .filter(av => av.time.shift == 'afternoon' && av.time.to <= 6)
    .sort((a, b) => a.time.to - b.time.to);

  const evening = availability
    .filter(av => av.time.shift == 'afternoon' && av.time.to > 6)
    .sort((a, b) => a.time.to - b.time.to);

  return [morning, afternoon, evening];
});
</script>

<style scoped>
.time-chip {
  @apply py-2 rounded-lg w-full text-sm text-center line-clamp-1 overflow-visible;
}

.time-normal {
  @apply border shadow-sm;
}

.time-booked {
  @apply bg-gray-200 text-gray-400;
}

.time-selected {
  @apply bg-orange-200 border-orange-500 text-orange-500;
}
</style>
