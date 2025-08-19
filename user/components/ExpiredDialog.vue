<template>
  <div class="p-4">
    <div class="flex justify-center mt-7 mb-4">
      <IconCircleX color="#f8fafc" fill="#dc2626" :size="100" />
    </div>
    <div class="flex flex-col mb-4 items-center">
      <div class="text-red-500 text-2xl font-bold">Payment Failed</div>
      <div class="text-md">Booking expired</div>
    </div>
    <div class="w-full text-center text-sm text-gray-500 font-light px-7 mb-4">
      Please pay the amount within 5 minutes before it expires.
    </div>
    <div class="flex gap-4">
      <div
        class="w-full flex justify-center items-center rounded-lg line-clamp-1 p-3 text-center font-bold text-md bg-orange-500 text-white"
        @click="
          () => {
            router.back();
          }
        "
      >
        <div>Book Again</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter();
  const route = useRoute();
</script>

<style scoped></style>
