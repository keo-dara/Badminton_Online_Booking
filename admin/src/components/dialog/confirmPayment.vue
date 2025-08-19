<template>
  <n-modal @close="hideDialog" :title="$t('confirmPayment')" preset="dialog" :show="show"
    :style="{ width: '500px', height: '500px' }">
    <div class="flex flex-col items-center">
      <div v-if="qrWithSaleInfo?.sale?.status === SaleStatus.Pending">
        <div class="bg-red-600 text-white text-center py-2 rounded-t-lg">
          KHQR
        </div>
        <div class="border border-t-0 rounded-b-lg p-1">
          <p class="text-2xl font-bold mb-4">{{ payment!.sale!.total }} <span class="text-sm font-normal">USD</span>
          </p>
          <div class="flex justify-center mb-4">
            <img :src="payment!.qr" alt="QR Code" class="w-40 h-40" />
          </div>
          <p class="text-center text-sm text-gray-600">
            Scan with ABA Mobile, or other<br>
            Mobile Banking App supporting<br>
            KHQR
          </p>
        </div>


      </div>
      <button v-if="qrWithSaleInfo?.sale?.status === SaleStatus.Pending"
        class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold mt-4" @click="confirmCash">
        {{ $t('confirmByCash') }}
      </button>
    </div>

    <div v-if="qrWithSaleInfo?.sale?.status === SaleStatus.Paid"
      class="flex flex-col items-center justify-between w-full h-full">
      <span class="text-white py-2 px-1 rounded-lg text-xl">
        Payment Successful
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <p class="text-2xl font-bold mb-4 text-center">{{ qrWithSaleInfo.sale.total }} <span
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
import { SalePayment, SaleStatus, type QrWithSale, type Sale } from '~/models';
import { NModal } from "naive-ui";
import { getImageQr } from '~/api';

const qrWithSaleInfo = ref<QrWithSale>()

const props = defineProps<{
  show: boolean,
  payment?: QrWithSale,
}>()

const emit = defineEmits(['confirmed', 'close', 'success'])

const hideDialog = () => {
  emit('close')
}
const confirmKhQr = () => {
  emit('confirmed', SalePayment.KhQr)
}
const confirmCash = () => {
  emit('confirmed', SalePayment.Cash)
}

let pollInterval: any | null = null;

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
  pollInterval = setInterval(() => getQrPayment(props.payment?.sale?.id!), 2000);
};


const getQrPayment = async (id: number) => {
  try {
    qrWithSaleInfo.value = await getImageQr(id);

    if (qrWithSaleInfo.value.sale?.status === SaleStatus.Paid) {
      emit('success')
      clearInterval(pollInterval);

    }
  } catch (error) {
  }
}



</script>
