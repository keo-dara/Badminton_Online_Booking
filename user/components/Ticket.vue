<template>
  <div v-if="qrPayment?.booking" class="rounded-lg w-full p-6 mt-8 bg-white text-md flex flex-col items-start gap-2">
    <div v-if="showLogo" class="flex justify-center w-full mb-6 mt-3">
      <img src="public/logo.svg" alt="" class="h-12" />
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Booking ID</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end">{{ qrPayment.booking.no }}</div>
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Name</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end">{{ qrPayment.booking.customer }}</div>
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Phone</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end">{{ qrPayment.booking.phone }}</div>
    </div>

    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Time</div>
      <div class="text-gray-500">:</div>
      <div class="w-full flex flex-wrap justify-end gap-1">
        <div v-for="time in qrPayment.booking.times" class="w-fit px-1 bg-blue-200/50 rounded-md text-blue-500">
          {{ displayTime(time.time) }}
        </div>
      </div>
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Date</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end">
        {{ dayjs(qrPayment.booking.bookingDate).format('MMMM DD, YYYY') }}
      </div>
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Court</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end">{{ qrPayment.booking.courtName }}</div>
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Status</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end flex justify-end">
        <Status :status="status ?? qrPayment.booking.status" />
      </div>
    </div>
    <div class="flex justify-between w-full">
      <div class="w-full text-gray-500">Deposit</div>
      <div class="text-gray-500">:</div>
      <div class="w-full text-end">
        {{ `$${qrPayment.booking.price.toFixed(2)}` }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from '#build/dayjs.imports.mjs';
import type { Status } from '~/models/booking';
import type { QRPayment } from '~/models/payment';
import type { Time } from '~/models/time';

const props = defineProps<{
  qrPayment: QRPayment;
  showLogo: boolean;
  status?: Status;
}>();

function displayTime(time: Time) {
  if (time.shift == 'morning') {
    return `${time.from}:00 - ${time.to}:00`;
  }
  if (time.shift == 'afternoon') {
    if (time.from == 12) return `${time.from}:00 - ${time.to + 12}:00`;
    return `${time.from + 12}:00 - ${time.to + 12}:00`;
  }
}
</script>

<style scoped></style>
