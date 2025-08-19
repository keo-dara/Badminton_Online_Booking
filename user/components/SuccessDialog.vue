<template>
  <div class="p-4">
    <div class="flex justify-center mt-7 mb-4">
      <IconCircleCheck color="#f8fafc" fill="#22c55e" :size="100" />
    </div>
    <div class="flex flex-col mb-4 items-center">
      <div class="text-orange-500 text-2xl font-bold">Thank you !!</div>
      <div class="text-md">Booking Successful</div>
    </div>
    <div class="w-full text-center text-sm text-gray-500 font-light px-7 mb-4">
      Please arrive 15 minutes before your booking time.
    </div>
    <div class="flex gap-4">
      <div
        class="w-full flex justify-center items-center rounded-lg line-clamp-1 p-3 text-center font-bold text-md bg-orange-500 text-white"
        @click="
          () => {
            router.push(`/booking-detail/${route.params.id}`);
          }
        "
      >
        <div>View Receipt</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter();
  const route = useRoute();
</script>

<style scoped></style>
