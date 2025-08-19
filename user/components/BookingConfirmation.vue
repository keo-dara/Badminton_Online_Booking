<template>
  <div class="bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      <div class="bg-orange-500 p-6 text-center flex items-center flex-col">
        <img src="public/logo_short.png" alt="logo" class="items-center w-24" />
      </div>
      <div class="p-6">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Thank You</h2>
        <p class="text-center text-gray-600 mb-6">
          Thank you for your payment with <span class="text-nowrap">V-SMASH</span> Badminton Club online booking
        </p>
        <div class="space-y-4">
          <div class="flex items-center">
            <div class="bg-orange-100 rounded-full p-2 mr-4">
              <IconUser class="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Name</p>
              <p class="font-semibold">{{ payment?.booking!.customer }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="bg-orange-100 rounded-full p-2 mr-4">
              <IconPhone class="w-6 h-6 text-orange-500 " />
            </div>
            <div>
              <p class="text-sm text-gray-500">Phone</p>
              <p class="font-semibold">{{ payment?.booking!.phone }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="bg-orange-100 rounded-full p-2 mr-4">
              <IconCalculator class="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Date</p>
              <p class="font-semibold">{{
                dayjs(payment?.booking.bookingDate).format('dddd,').toUpperCase() +
                dayjs(payment?.booking.bookingDate).format(' MMMM DD, YYYY')
              }}</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="bg-orange-100 rounded-full p-2 mr-4">
              <IconClock class="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Time</p>
              <p class="font-semibold">
              <div v-for="time in payment.booking.times">
                {{ displayTime(time.time) }}
              </div>
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="bg-orange-100 rounded-full p-2 mr-4">
              <IconMapPin class="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Court</p>
              <p class="font-semibold">{{ payment?.booking!.courtName }}</p>
            </div>
          </div>
        </div>
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Booking ID</span>
            <span class="font-semibold">{{ payment?.booking.no }}</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-gray-600">Status</span>
            <Status :status="payment?.booking.status ?? 'pending'" />
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-gray-600">Deposit</span>
            <span class="font-semibold">{{ `$${payment?.booking!.price.toFixed(2)}` }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from '#build/dayjs.imports.mjs';
import type { QRPayment } from '~/models/payment';
import type { Time } from '~/models/time';


defineProps<{
  payment: QRPayment
}>()

function displayTime({from, to,shift}: Time) {
   function convertTime(h: number) {
    let hour = Number(h);
    let minutes = '';

    if (hour % 1 !== 0) {
      minutes = '30';
    } else {
      minutes = '00';
    }

    if (shift.trim() === 'afternoon' && hour !== 12) {
      hour += 12;
    }
    if (shift.trim() === 'morning' && hour === 12) {
      hour = 12;
    }
    return hour.toString().replace('.5', '').padStart(2, '0') + ':' + minutes;
  }

  const startTime = convertTime(from);
  const endTime = convertTime(to);

  return `${startTime}-${endTime}`;
}
</script>
