<template>
  <div class="bg-white shadow-lg rounded-lg">
    <div class="bg-[#E1232E] flex justify-center py-2 rounded-t-lg">
      <img
        src="public/images/khqr.png"
        alt="KHQR Logo"
        width="{100}"
        height="{40}"
        class="h-10 w-auto"
      />
    </div>
    <div class="p-6 space-y-4">
      <div class="text-center">
        <h2 class="text-lg font-light text-gray-600">Leangheng HORM</h2>
        <p class="text-3xl font-bold text-gray-800">${{ amount.toFixed(2) }}</p>
      </div>
      <div class="border-b border-dashed border-gray-300"></div>
      <div class="flex justify-center">
        <img :src="qr" alt="" class="w-60 h-60" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{ qr: string; amount: number }>();
</script>

<style scoped></style>
