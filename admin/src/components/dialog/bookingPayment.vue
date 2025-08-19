<template>
  <n-modal @close="hideDialog" :title="$t('confirmPayment')" preset="dialog" :show="show"
    :style="{ width: '450px', height: '240px' }">
    <div class="flex flex-col items-center justify-center">

      <n-spin size="small" v-if="!qrWithSaleInfo" />

      <div class="w-full mt-4 flex items-center">
        <n-checkbox v-model:checked="enablePushNotification">
          {{ $t('enablePushNotification') }}
        </n-checkbox>
      </div>
      

      <button v-if="qrWithSaleInfo?.booking?.status === SaleStatus.Pending"
        class="w-full  bg-blue-500 text-white py-3 rounded-lg font-semibold mt-4" @click="confirmCash">
        {{ $t('confirmByCash') }}
      </button>
      <button class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold mt-4" @click="hideDialog">
        {{ $t('close') }}
      </button>
    </div>

    <div
      v-if="qrWithSaleInfo?.booking?.status === SaleStatus.Paid || qrWithSaleInfo?.booking?.status === SaleStatus.PaidSome"
      class="flex flex-col items-center justify-between w-full h-full">
      <span class="text-white py-2 px-1 rounded-lg text-xl">
        Payment Successful
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <p class="text-2xl font-bold mb-4 text-center">{{ payment?.amount ?? 'N/A' }} <span
          class="text-sm font-normal">USD</span>
      </p>
      <p class="text-center text-sm text-gray-600 mb-2">
        Your payment has been processed successfully.
      </p>
      <p class="text-center text-sm text-gray-600">
        Thank you for your purchase!
      </p>
      <button class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold mt-4" @click="hideDialog">
        {{ $t('continue') }}
      </button>
    </div>
  </n-modal>
</template>

<script lang="ts" setup>
import { SalePayment, SaleStatus, type QrWithBooking } from '~/models';
import { NModal, NSpin, NCheckbox } from "naive-ui";
import { getImageQrBooking } from '~/api';

const enablePushNotification = ref(true);

const qrWithSaleInfo = ref<QrWithBooking>()
let pollInterval: any | null = null;

const props = defineProps<{
  show: boolean,
  payment?: QrWithBooking,
}>()

const emit = defineEmits(['confirmed', 'close', 'success'])

const hideDialog = () => {
  emit('close')
}

const confirmCash = () => {
  emit('confirmed', SalePayment.Cash, enablePushNotification.value)
}


onMounted(() => {
  onInitPayment();
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  qrWithSaleInfo.value = undefined;
});

const onInitPayment = async () => {
  pollInterval = setInterval(() => getQrPayment(props.payment?.booking?.id!), 5000);
};

const getQrPayment = async (id: number) => {
  try {

    qrWithSaleInfo.value = await getImageQrBooking(id);
    const status = qrWithSaleInfo.value.booking?.status;

    if (status === SaleStatus.Paid || status === SaleStatus.PaidSome) {
      emit('success', status)
      clearInterval(pollInterval);
    }
  } catch (error) {
  }
}
</script>
