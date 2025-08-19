<template>
  <n-modal 
    @close="hideDialog" 
    :title="$t('confirmPayment')" 
    preset="dialog" 
    :show="show"
    :style="{ width: '500px', height: '300px' }"
  >
    <div class="flex flex-col items-center justify-center">
      AMOUNT 
      <p class="text-3xl font-bold">
        ${{ qrWithSaleInfo?.amount }}
      </p>
      
      <n-spin size="small" v-if="!qrWithSaleInfo" />
      
      <div class="w-full mt-4 flex items-center">
        <n-checkbox v-model:checked="enablePushNotification">
          {{ $t('enablePushNotification') }}
        </n-checkbox>
      </div>
      
      <button 
        v-if="qrWithSaleInfo?.booking?.status === SaleStatus.PaidSome"
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mt-4" 
        @click="confirmCash"
      >
        {{ $t('confirmByCash') }}
      </button>
    </div>
    <button 
      class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold mt-4" 
      @click="hideDialog"
    >
      {{ $t('close') }}
    </button>
  </n-modal>
</template>

<script lang="ts" setup>
import { SalePayment, SaleStatus, type QrWithBooking } from '~/models';
import { NModal, useNotification, NSpin, NCheckbox } from "naive-ui";
import { getImageQrBooking } from '~/api';

const qrWithSaleInfo = ref<QrWithBooking>();
const enablePushNotification = ref(true);

const props = defineProps<{
  show: boolean,
  payment?: QrWithBooking,
}>();

const emit = defineEmits(['confirmed', 'close', 'success']);

const hideDialog = () => {
  emit('close');
};

const confirmCash = () => {
  emit('confirmed', SalePayment.Cash, enablePushNotification.value);
};

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
  pollInterval = setInterval(() => getQrPayment(props.payment?.booking?.id!), 2000);
};

const notification = useNotification();

const getQrPayment = async (id: number) => {
  try {
    qrWithSaleInfo.value = await getImageQrBooking(id);
    const status = qrWithSaleInfo.value.booking?.status;
    
    if (status === SaleStatus.Paid || status === SaleStatus.PaidSome) {
      emit('success', status, enablePushNotification.value);
      clearInterval(pollInterval);
      notificationSuccess(notification);
    }
  } catch (error) {
  }
};
</script>