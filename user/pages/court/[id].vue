<template>
  <div class="h-dvh bg-white flex flex-col overflow-scroll">
    <div class="sticky top-0">
      <div :class="`aspect-[5/3] brightness-50 bg-cover`">
        <img :src="courtStore.courtDetail?.court.img" :alt="courtStore.courtDetail?.court.name">
      </div>
      <div class="absolute z-40 top-4 left-4 p-2 rounded-lg bg-white" @click="router.push('/')">
        <IconChevronLeft />
      </div>
      <div class="absolute bottom-8 left-4 right-4 p-2 rounded-lg z-20">
        <p class="text-xl font-bold text-white">
          {{ courtStore.courtDetail?.court.name }}
        </p>
        <p class="text-sm text-slate-400 line-clamp-2 text-ellipsis">
          {{ courtStore.courtDetail?.court.description }}
        </p>
      </div>
    </div>
    <div v-if="!courtStore.courtDetail?.court.id" class="grow w-full bg-white flex justify-center items-center">
      <VanLoading />
    </div>
    <div v-else class="relative grow bg-white rounded-t-xl py-4 px-4 z-10 -mt-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-2xl py-4 px-2 bg-orange-500 text-white flex flex-col justify-center items-center"
          @click="showCalendar = true">
          <p class="text-md font-bold pb-1">
            {{ dayjs(selectedDate).format('YYYY') }}
          </p>
          <p class="text-4xl font-bold">
            {{ dayjs(selectedDate).format('MMM') }}
          </p>
        </div>
        <div class="rounded-2xl py-4 px-2 bg-orange-500 text-white flex flex-col justify-center items-center"
          @click="showCalendar = true">
          <p class="text-md font-bold">
            {{ dayjs(selectedDate).format('ddd') }}
          </p>
          <p class="text-4xl font-bold">
            {{ dayjs(selectedDate).format('DD') }}
          </p>
        </div>
      </div>
      <div class="text-md text-gray-700 font-bold pt-4 mt-2">
        Available Times
      </div>
      <SelectTime v-model="selectedTimes" :selected-date="selectedDate" />
    </div>
    <div
      class="sticky bottom-0 z-50 border-t flex justify-between items-center bg-white shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.3)] px-4 pt-4 pb-6">
      <div class="w-full">
        <div class="text-sm text-gray-500">Total</div>
        <div class="flex flex-row items-end gap-1">
          <div class="text-3xl font-semibold">
            {{ `$${bookingInfo.discount.toFixed(2)}` }}
          </div>
          <div v-if="courtStore.courtDetail!.court.discount != 0"
            class="text-xl font-semibold line-through text-gray-400 ">
            {{ `$${bookingInfo.total.toFixed(2)}` }}
          </div>
        </div>
      </div>
      <div class="w-full rounded-lg p-3 line-clamp-1 text-center font-bold text-md" :class="bookingInfo.total == 0 ? 'bg-gray-200 text-gray-500' : 'bg-orange-500 text-white'
        " @click="bookNow">
        Book Now
      </div>
    </div>
  </div>

  <VanPopup v-model:show="showCustomerInfo" position="bottom" class="!max-w-[480px] !left-auto rounded-t-xl"
    :close-on-click-overlay="false" :closeable="true">
    <BookingInfo :bookingAt="selectedDate" :courtId="courtStore.courtDetail!.court.id!"
      :timeId="selectedTimes!.map(time => time.time.id)" v-on:created="refreshCourt" />
  </VanPopup>


  <VanCalendar v-model:show="showCalendar" class="!max-w-[480px] !left-auto" :show-confirm="false" :min-date="minDate"
    @confirm="confirmDate" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import type { Availability } from '~/models/availability';
import { useCourtStore } from '~/store/court';

const router = useRouter();
const route = useRoute();
const courtStore = useCourtStore();

const selectedTimes = ref<Availability[]>();

const showCustomerInfo = ref(false);

const showCalendar = ref(false);
let selectedDate = ref(new Date());
const minDate = new Date();

watch(() => route.query.status, async (val) => {
  if (val === 'cancel') {
    onCancel();
  }
});

const refreshCourt = async () => {

  if (selectedDate.value) {
    await getDetail(selectedDate.value.getTime());
  } else {
    await getDetail(Date.now());
  }
  selectedTimes.value = [];
  showCustomerInfo.value = false
}

function onCancel() {
  showConfirmDialog({
    title: 'Booking Unsuccesful',
    message: 'Payment was not successful. Please try again.',
    confirmButtonColor: '#dc2626',
    showCancelButton: false
  }).then(async () => {
    await router.push(`/court/${route.params.id}`);
  });
}

async function bookNow() {
  if (bookingInfo.value.total == 0) return null;
  showCustomerInfo.value = true;
  // router.push(`/court/${route.params.id}?status=cancel`);
}

onMounted(() => {
  if (route.query.status === 'cancel') {
    onCancel();
  }
})

async function confirmDate(val: Date) {
  showCalendar.value = false;
  selectedDate.value = val;
  selectedTimes.value = [];
  await getDetail(selectedDate.value.getTime());
}

const bookingInfo = computed(() => {
  var total: number = 0;
  selectedTimes.value?.forEach(time => {
    const price: number = Number(time.time.price);
    total += price;
  });
  const discountDecimal = (courtStore.courtDetail!.court.discount ?? 0) / 100;
  const discount = total * discountDecimal;
  return {
    total,
    discount: total - discount,
  };
});

async function getDetail(time: number) {
  await courtStore.fetchCourtDetail(route.params.id as string, time);
}

await getDetail(Date.now());
</script>
