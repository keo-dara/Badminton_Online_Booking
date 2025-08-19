<template>
  <div class="flex flex-col h-screen">
    <div class="flex items-center px-4 pt-6 pb-3 sticky top-0 bg-slate-100">
      <div class="p-2 absolute left-4 rounded-lg bg-white" @click="back">
        <IconChevronLeft />
      </div>
      <div class="w-full text-center text-lg font-bold">Waiting Payment</div>
    </div>
    <!-- Booking Info -->
    <div v-if="!qrPayment?.booking || !qrPayment.qr" class="grow w-full bg-white flex justify-center items-center">
      <VanLoading />
    </div>





    <div id="aba_main_modal" class="aba-modal">
      <!-- Modal content -->
      <div class="aba-modal-content">
        <form method="POST" target="aba_webservice" :action="qrPayment?.booking.url" id="aba_merchant_request">
          <input type="hidden" name="hash" :value="qrPayment?.booking.hashString" id="hash" />
          <input type="hidden" name="tran_id" :value="qrPayment?.booking.no" id="tran_id" />
          <input type="hidden" name="amount" :value="qrPayment?.booking.price" id="amount" />
          <input type="hidden" name="firstname" value="" />
          <input type="hidden" name="lastname" value="" />
          <input type="hidden" name="phone" value="" />
          <input type="hidden" name="email" value="" />
          <input type="hidden" name="req_time" :value="qrPayment?.booking.time" />
          <input type="hidden" name="merchant_id" value="vsmashbadmintonclub" />
          <input type="hidden" name="payment_option" class="payment_option" style="margin: 14px;float: left;" checked
            value="abapay_khqr">
        </form>
      </div>

    </div>
  </div>

  <VanPopup v-model:show="isPaid" round :closeable="false" :close-on-click-overlay="false"
    class="!w-[80vw] !max-w-[400px]">
    <SuccessDialog />
  </VanPopup>

  <VanPopup v-model:show="isDetail" round :closeable="true" :close-on-click-overlay="true"
    class="!w-[80vw] !max-w-[400px]">
    <Ticket v-if="qrPayment" :qrPayment="qrPayment" :showLogo="false" :status="status" />
  </VanPopup>

  <VanPopup v-model:show="isExpired" round :closeable="false" :close-on-click-overlay="false"
    class="!w-[80vw] !max-w-[400px]">
    <ExpiredDialog />
  </VanPopup>
</template>

<script setup lang="ts">
import { getQR } from '~/api/booking';
import ExpiredDialog from '~/components/ExpiredDialog.vue';
import { Status } from '~/models/booking';
import type { QRPayment } from '~/models/payment';
import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';

Locale.use('en-US', enUS);

useHead({
  script: [
    {
      src: "https://checkout.payway.com.kh/plugins/checkout2-0.js",
      type: "text/javascript",
      defer: true,
    },
  ],
});


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
  await new Promise(resolve => setTimeout(resolve, 2000));


  fetchQrInterval = setInterval(async () => {
    qrPayment.value = await getQR(route.params.id as string);
  }, 3 * 1000);


  if (qrPayment.value.booking.status === Status.Pending) {
    AbaPayway.checkout()
  }
});

onUnmounted(() => {
  clearInterval(countDownInterval);
  clearInterval(fetchQrInterval);
});
</script>
