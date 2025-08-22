<template>
  <div class="flex flex-col h-screen">
    <div class="flex items-center px-4 pt-6 pb-3 sticky top-0 bg-slate-100">
      <div class="p-2 absolute left-4 rounded-lg bg-white" @click="back">
        <IconChevronLeft />
      </div>
      <div class="w-full text-center text-lg font-bold">Waiting Payment</div>
    </div>
    <!-- Booking Info -->
    <div
      v-if="!qrPayment?.booking || !qrPayment.qr"
      class="grow w-full bg-white flex justify-center items-center"
    >
      <VanLoading />
    </div>
    <div class="max-w-md w-full mx-auto px-12 pb-6 mt-4">
      <!-- Payment Info -->
      <KHQR
        v-if="qrPayment?.qr"
        :qr="qrPayment.qr"
        :amount="qrPayment.booking.price"
      />

      <button
        @click="() => (isDetail = true)"
        class="w-full px-4 py-4 text-sm font-medium mt-2 text-gray-700 bg-white rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        View Booking Details
        <i class="lucide-info ml-2 h-4 w-4 inline-block"></i>
      </button>
    </div>

    <!-- Confirm btn -->
    <div class="grow"></div>

    <div
      class="sticky bottom-0 bg-white flex items-center shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.3)] px-4 pt-4 pb-6"
    >
      <div
        class="w-full flex justify-center items-center rounded-lg line-clamp-1 p-3 text-center font-bold text-md text-gray-500 bg-gray-200"
        @click="() => (isExpired ? back() : null)"
      >
        <div>{{ isExpired ? 'Booking Expired' : 'Expired in:' }}</div>
        <div class="ml-3" v-if="!isExpired">{{ timerOutput }}</div>
      </div>
    </div>
  </div>

  <VanPopup
    v-model:show="isPaid"
    round
    :closeable="false"
    :close-on-click-overlay="false"
    class="!w-[80vw] !max-w-[400px]"
  >
    <SuccessDialog />
  </VanPopup>

  <VanPopup
    v-model:show="isDetail"
    round
    :closeable="true"
    :close-on-click-overlay="true"
    class="!w-[80vw] !max-w-[400px]"
  >
    <Ticket
      v-if="qrPayment"
      :qrPayment="qrPayment"
      :showLogo="false"
      :status="status"
    />
  </VanPopup>

  <VanPopup
    v-model:show="isExpired"
    round
    :closeable="false"
    :close-on-click-overlay="false"
    class="!w-[80vw] !max-w-[400px]"
  >
    <ExpiredDialog />
  </VanPopup>
</template>

<script setup lang="ts">
  import { getQR } from '~/api/booking';
  import ExpiredDialog from '~/components/ExpiredDialog.vue';
  import type { Status } from '~/models/booking';
  import type { QRPayment } from '~/models/payment';
  import { Locale } from 'vant';
  import enUS from 'vant/es/locale/lang/en-US';

  Locale.use('en-US', enUS);

  const router = useRouter();
  const route = useRoute();
  const qrPayment = ref<QRPayment>();

  const timerOutput = ref('');
  const endTime = ref(new Date().getTime());
  const isExpired = ref(false);
  const isDetail = ref(false);

  const isPaid = computed(() => {
    if (qrPayment.value?.booking.status.includes('paid')) {
      clearInterval(countDownInterval);
      clearInterval(fetchQrInterval);
    }
    return qrPayment.value?.booking.status.includes('paid');
  });

  const status = computed(() => {
    if (isExpired.value) return 'Expired' as Status;
    return qrPayment.value?.booking.status;
  });

  function startTimer() {
    const timeNow = new Date().getTime();
    const timeDifference = endTime.value - timeNow;

    const millisecondsInOneSecond = 1000;
    const millisecondsInOneMinute = millisecondsInOneSecond * 60;
    const millisecondsInOneHour = millisecondsInOneMinute * 60;

    const remainderDifferenceInMinutes =
      (timeDifference % millisecondsInOneHour) / millisecondsInOneMinute;

    const remainderDifferenceInSeconds =
      (timeDifference % millisecondsInOneMinute) / millisecondsInOneSecond;

    const remainingMinutes = Math.floor(remainderDifferenceInMinutes);
    const remainingSeconds = Math.floor(remainderDifferenceInSeconds);

    if (remainingMinutes < 0 && remainingSeconds < 0) {
      isExpired.value = true;
      clearInterval(countDownInterval);
      clearInterval(fetchQrInterval);
    }

    timerOutput.value =
      `${remainingMinutes}`.padStart(2, '0') +
      ' : ' +
      `${remainingSeconds}`.padStart(2, '0');
  }

  function back() {
    if (isExpired.value) {
      router.back();
      return;
    }
    showConfirmDialog({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking ?',
      confirmButtonColor: '#dc2626'
    }).then(() => router.back());
  }

  let countDownInterval: any;
  let fetchQrInterval: any;

  onBeforeMount(async () => {
    qrPayment.value = await getQR(route.params.id as string);
    endTime.value =
      new Date(qrPayment.value.booking.createdAt).getTime() + 5 * 60 * 1000;

    countDownInterval = setInterval(() => {
      if (qrPayment.value?.booking.createdAt) startTimer();
    }, 1000);

    fetchQrInterval = setInterval(async () => {
      qrPayment.value = await getQR(route.params.id as string);
    }, 5 * 1000);
  });

  onUnmounted(() => {
    clearInterval(countDownInterval);
    clearInterval(fetchQrInterval);
  });
</script>

<style scoped></style>
