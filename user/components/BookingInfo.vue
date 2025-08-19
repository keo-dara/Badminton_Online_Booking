<template>
  <div class="p-4">
    <div class="flex gap-3 mb-3">
      <div class="text-white bg-orange-500 rounded-md flex w-fit p-2 gap-2">
        <IconCalendar color="#ffffff" />
        <p>{{ dayjs(bookingAt).format('MMM DD, YYYY') }}</p>
      </div>
    </div>
    <div class="rounded-lg mb-4 bg-white text-md">
      <p class="text-black font-semibold">Phone number</p>
      <div class="flex gap-3 items-center mt-1 mb-3">
        <IconPhone color="#9ca3af" />
        <input ref="phoneNumberRef" type="text" placeholder="Ex: 012345678" class="rounded-md border p-3 w-full"
          v-model="phoneNumber" pattern="\d{1,5}" />
      </div>
      <p class="text-black font-semibold">Name</p>
      <div class="flex gap-3 items-center mt-1 mb-3">
        <IconUser color="#9ca3af" />
        <input type="text" placeholder="Ex: John" class="rounded-md border p-3 w-full" v-model="name" />
      </div>
    </div>
    <div class="pb-2 text-lg font-bold">Deposit</div>
    <div class="flex justify-start gap-2 mb-3">
      <div v-for="deposit in deposits" class="py-2 rounded-lg w-full text-sm text-center line-clamp-1 border" :class="selectedDeposit == deposit
        ? 'bg-orange-200 border-orange-500 text-orange-500'
        : ' shadow-sm'
        " @click="() => (selectedDeposit = deposit)">
        {{ `${deposit}%` }}
      </div>
    </div>

    <div
      class="w-full p-2.5 flex gap-2 items-center bg-white shadow-[0px_1px_4px_0px_rgba(183,190,203,0.36)] rounded-lg">

      <div class="relative w-[40px] h-[36px] overflow-hidden">
        <img src="/images/payment_khqr.png" alt="" />
      </div>
      <div class="grow">
        <p class="text-xs font-bold text-[#081B37]">ABA KHQR</p>
        <p class="text-xs font-light text-[#697386]">
          Scan to pay with any banking app
        </p>
      </div>
    </div>
    <div class="w-full flex justify-center gap-3 rounded-lg p-3 line-clamp-1 text-center font-bold text-md mt-4" :class="disableConfirm
      ? 'bg-gray-200 text-gray-500'
      : 'bg-orange-500 text-white'
      " @click="() => (disableConfirm ? null : onConfirm())">
      <IconCreditCard />
      <p>Confirm Booking</p>
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
          <input type="hidden" name="continue_success_url" :value="'https://www.vsmashbadminton.online/booking-detail/'+qrPayment?.booking.id" />
          <input type="hidden" name="payment_option" class="payment_option" style="margin: 14px;float: left;" checked
            value="abapay_khqr">
        </form>
      </div>

    </div>
  </div>

</template>

<script setup lang="ts">
import dayjs from '#build/dayjs.imports.mjs';
import { booking, getQR } from '~/api/booking';
import type { BookingParams } from '~/models/booking';
import type { QRPayment } from '~/models/payment';

const props = defineProps<{
  bookingAt: Date;
  timeId: number[];
  courtId: number;
}>();

const emit = defineEmits(['created'])

const savedName = useCookie<string | undefined>('name');
const savedPhone = useCookie<string | undefined>('phone');
const name = ref(savedName.value ?? '');
const phoneNumber = ref(savedPhone.value ?? '');
const phoneNumberRef = ref<InstanceType<typeof HTMLDivElement>>();
const deposits = ref([100]);
const selectedDeposit = ref(100);

const qrPayment = ref<QRPayment>();

const disableConfirm = computed(() => {
  return name.value.length == 0 || phoneNumber.value.length == 0;
});

async function onConfirm() {
  const params: BookingParams = {
    customer: name.value,
    phone: phoneNumber.value,
    bookingAt: props.bookingAt.getTime(),
    courtId: props.courtId,
    timeId: props.timeId,
    bookPercent: selectedDeposit.value
  } as BookingParams;


  savedName.value = name.value;
  savedPhone.value = phoneNumber.value;

  try {
    showLoadingToast({
      message: 'Loading...'
    });
    const { id } = await booking(params);
    closeToast();

    if (id) {
      qrPayment.value = await getQR(`${id}`);
      emit('created')
      await new Promise(resolve => setTimeout(resolve, 1000));
      AbaPayway.checkout();
    }
  } catch (error: any) {
    showFailToast({ message: error.data.message });
  }
}

onMounted(() => {
  phoneNumberRef.value?.addEventListener('input', (e: Event) => {
    let value = e.target?.value;

    value = value.replace(/[^0-9]/g, '');

    if (!value.startsWith('0') && value.length >= 1) {
      value = '0' + value;
    }

    phoneNumberRef.value!.value = value;
  });
});
</script>
