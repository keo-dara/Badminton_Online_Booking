<template>
  <div class="p-1">
    <BackHeader :title="$i18n.t('plans')">
      <div class="mt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="plan in plans" :key="plan.id"
            class="rounded-lg border-solid border-2 border-sky-500 shadow-md p-6 flex flex-col">
            <h3 class="text-xl font-semibold mb-2">{{ plan.name }}</h3>
            <p class="text-gray-600 mb-4">${{ plan.price }}</p>
            <NButton type="primary" @click="openKHQRDialog(plan.id)" class="w-full">
              {{ $i18n.t('selectPlan') }}
            </NButton>
          </div>
        </div>
      </div>
    </BackHeader>

    <NModal v-model:show="showKHQRDialog">
      <NCard style="width: 600px" :title="$i18n.t('scanKHQR')" :bordered="false" size="huge" role="dialog"
        aria-modal="true">
        <div class="flex flex-col items-center">
          <template v-if="subscription?.payment.status === BakongStatus.Success">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-green-600 mb-4">{{ $i18n.t('paymentSuccess') }}</h3>
              <p class="mb-6">{{ $i18n.t('thankYouForSubscription') }}</p>
              <NButton type="primary" @click="goToHome">{{ $i18n.t('goToHome') }}</NButton>
            </div>
          </template>
          <template v-else>
            <img :src="info?.qr" class="w-64 h-64 bg-gray-200 mb-4">
            <!-- <p>{{ subscription?.payment.status }}</p> -->
          </template>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <NButton @click="closeKHQRDialog">{{ $i18n.t('cancel') }}</NButton>
          </div>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
const { $i18n } = useNuxtApp();
import { ref } from 'vue';
import { NButton, NModal, NCard, useNotification } from 'naive-ui';
import { createSubscribe, fetchPlan, fetchSubscribe } from '~/api';
import { BakongStatus, type Plan, type Subscription } from '~/models';


onMounted(() => {
  fetchPlan().then((data) => {
    plans.value = data;
  })
})

const plans = ref<Plan[]>([]);
let pollInterval: any | null = null;


const showKHQRDialog = ref(false);
const selectedPlanId = ref();
const subscription = ref<Subscription>();
const info = ref<{
  id: number;
  qr: string;
}>();
const notification = useNotification();

const openKHQRDialog = async (planId: number) => {
  try {
    selectedPlanId.value = planId;
    showKHQRDialog.value = true;
    info.value = await createSubscribe(planId);
    await onInitPayment()
  } catch (error) {
    notificationHttpError(error, notification);
  }
};

const closeKHQRDialog = () => {
  showKHQRDialog.value = false;
  selectedPlanId.value = null;
  clearInterval(pollInterval);
};


onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});

const onInitPayment = async () => {
  pollInterval = setInterval(() => fetchPaymentResult(), 2000);
};


const fetchPaymentResult = async () => {
  try {
    subscription.value = await fetchSubscribe(info.value?.id!);
    if (subscription.value.payment.status === BakongStatus.Success) {
      clearInterval(pollInterval);
    }
  } catch (error) {
  } finally { }
};
const router = useRouter()
const goToHome = () => {
  router.push('/');
};


</script>