<template>
  <div v-if="status == 'Expired'" class="w-fit px-1 bg-gray-200/50 rounded-md text-gray-500">
    {{ displayStatus() }}
  </div>
  <div v-else-if="status == 'pending'" class="w-fit px-1 bg-yellow-200/50 rounded-md text-yellow-500">
    {{ displayStatus() }}
  </div>
  <div v-else-if="status == 'cancelled'" class="w-fit px-1 bg-gray-200/50 rounded-md text-gray-500">
    {{ displayStatus() }}
  </div>
  <div v-else-if="status.includes('paid')" class="w-fit px-1 bg-green-200/50 rounded-md text-green-500">
    {{ displayStatus() }}
  </div>
  <div v-else-if="status == 'draft'" class="w-fit px-1 bg-blue-200/50 rounded-md text-blue-500">
    {{ displayStatus() }}
  </div>
  <div v-else class="w-fit px-1 bg-yellow-200/50 rounded-md text-yellow-500">
    {{ displayStatus() }}
  </div>
</template>

<script setup lang="ts">
import type { Status } from '~/models/booking';

const props = defineProps<{ status: Status }>();

function displayStatus(): string {
  if (props.status.length === 0) return props.status;
  return props.status.charAt(0).toUpperCase() + props.status.slice(1).toUpperCase();
}
</script>

<style scoped></style>
