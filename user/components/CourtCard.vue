<template>
  <div v-if="!court.enable"></div>
  <div v-else class="mb-4 px-4 relative">
    <div class="rounded-lg bg-white shadow-sm p-4" @click="router.push(`/court/${court.id}`)">
      <div v-if="court.discount != 0"
        class="text-sm font-bold absolute top-10 right-10 rounded-lg bg-red-500 text-white py-2 px-4 rounded-bl-lg">
        {{ court.discount }}% OFF
      </div>
      <img class="h-auto aspect-video w-full bg-cover rounded-md" :src="court.img" />
      <div class="pt-4 gap-2 flex items-center justify-between">
        <div class="w-full overflow-clip">
          <p class="text-lg">{{ court.name }}</p>
          <p class="text-xs text-slate-400 text-ellipsis line-clamp-2">
            {{ court.description }}
          </p>
        </div>
        <div class="rounded-lg line-clamp-1 bg-orange-500 min-w-fit p-2 text-white text-md">
          Book Now
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Court } from '~/models/court';

const router = useRouter();

defineProps<{ court: Court }>();
</script>

<style scoped></style>
