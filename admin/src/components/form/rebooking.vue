<template>
  <n-form ref="formRef" :model="formData" :rules="rules">
    <n-form-item path="customer" :label="$t('customer')">
      <n-input v-model:value="formData.customer" @keydown.enter.prevent :placeholder="$t('customer')" />
    </n-form-item>
    <n-form-item path="phone" :label="$t('phone')">
      <n-auto-complete @select="handleCustomerSelect" :options="autocompletedOption" v-model:value="formData.phone"
        @keydown.enter.prevent :placeholder="$t('phone')" @update-value="autocompletedCustomer" />
    </n-form-item>
    <n-form-item path="name" :label="$t('date')">
      <n-date-picker :default-value="Date.now()" v-model:value="formData.bookingAt" type="date"
        :placeholder="$t('startDate')" :is-date-disabled="(timestamp: number) => timestamp < yesterday" />
    </n-form-item>
    <n-form-item path="court" :label="$t('court')">
      <n-select :loading="courtAsync.status.value === 'pending'" v-model:value="formData.courtId" filterable
        placeholder="Please select a court" :options="courtAsync.data.value!.data.map((court) => {
          return {
            label: court.name,
            value: court.id!,
          }
        })" class="pt-2" :max-tag-count="3" @update-value="onSelectCourt" />
    </n-form-item>

    <n-form-item path="timeId" :label="$t('time')">
      <div class="grid lg:grid-cols-3 md:grid-cols-4 grid-cols-3 gap-3 w-full">
        <div v-if="courtAsync.status.value !== 'pending' && !times.length">
          <p class="text-gray-400">Court has no time</p>
        </div>
        <div v-if="courtAsync.status.value !== 'pending'" v-for="av in times">
          <n-button class="w-full" :type="formData.timeId!.includes(av.time!.id!) ? 'primary' : 'default'"
            :ghost="formData.timeId!.includes(av.time.id!) ? false : true"
            :secondary="formData.timeId!.includes(av.time.id!) ? true : false" :disabled="av.isDisable" @click="() => {
              const index =
                formData.timeId!.findIndex(id => id == av.time.id) ?? -1;

              if (index != -1) {
                formData.timeId!.splice(index, 1);
              } else {
                formData.timeId!.push(av.time!.id!);
              }

              onUpdateTime(formData.timeId!)
            }
              ">
            {{
              av.displayTime
            }}
          </n-button>
        </div>
      </div>
    </n-form-item>

    <n-form-item class="mr-4" path="bookPercent" label="Total">
      <n-input-number disabled v-model:value="total" @keydown.enter.prevent placeholder="Paid" />
    </n-form-item>

    <div class="flex flex-row">
      <n-form-item class="mr-4" path="bookPercent" label="Paid Amount">
        <n-input-number disabled v-model:value="formData.price" @keydown.enter.prevent placeholder="Paid" />
      </n-form-item>
      <n-form-item path="bookPercent" label="% Amount">
        <n-input-number disabled v-model:value="formData.bookPercent" @keydown.enter.prevent placeholder="%" />
      </n-form-item>
    </div>

    <n-button round @click="createCategory" type="success">
      {{ isEditing ? $t('update') : $t('create') }}
    </n-button>
  </n-form>
</template>
<script setup lang="ts">
import type { FormInst, FormItemRule } from 'naive-ui';
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  useNotification,
  NSelect,
  NDatePicker,
  NAutoComplete,
  NInputNumber
} from 'naive-ui';
import {
  createBooking,
  fetchCustomer,
  updateBooking,
  fetchCourts,
  fetchCourtPublic
} from '~/api';
import { SaleStatus, type Availability, type Booking, type Time } from '~/models';

const yesterday = new Date(Date.now() - 86400000).getDate();
const props = defineProps<{
  booking?: Booking;
}>();

const total = ref(0);
const formRef = ref<FormInst | null>(null);
const emit = defineEmits(['added', 'updated']);
const { $i18n } = useNuxtApp();
const isEditing = ref(!!props.booking);
const times = ref<Availability[]>([]);
const notification = useNotification();
const autocompletedOption = ref<
  { label: string; value: string; customer: string }[]
>([]);

const onSelectCourt = async (courtId: number) => {
  times.value = await fetchCourtPublic(courtId, formData?.value.bookingAt ?? Date.now());
  times.value = sortAvailabilities(times.value);
};

const onUpdateTime = (ids: number[]) => {
  total.value = times.value.reduce((p, c) => {
    let price = 0;
    if (ids.includes(c.id!)) {
      price = +c.time.price!;
    }
    return p + price! * 1;
  }, 0);
  formData.value.bookPercent = (+formData.value.price! / total.value) * 100;
};

const courtAsync = await useAsyncData('timecourt', () =>
  fetchCourts({
    page: 1,
    pageSize: 20
  })
);

watch(
  () => courtAsync.data,
  async (newValue, _) => {
    if (newValue.value?.data.length != 0) {
      const courtId = newValue.value!.data[0].id!;
      onSelectCourt(courtId);
    }
  },
  { immediate: false }
);

const autocompletedCustomer = async () => {
  const { data } = await fetchCustomer({
    page: 1,
    pageSize: 10,
    search: formData.value.customer
  });
  autocompletedOption.value = data.map(v => ({
    label: `${v.phone}`,
    value: v.phone!,
    customer: v.name!
  }));
};

const handleCustomerSelect = (value: string) => {
  const selectedCustomer = autocompletedOption.value.find(
    option => option.value === value
  );
  if (selectedCustomer) {
    formData.value.customer = selectedCustomer.customer;
  }
};

const rules = {
  customer: {
    required: true,
    message: $i18n.t('validation.is_required', {
      field: $i18n.t('name')
    })
  },
  phone: {
    required: true,
    message: "Phone is invalid",
    validator: (_rule: FormItemRule, value: string) => {
      return /^\d+$/.test(value);
    },
    trigger: ['blur', 'change']
  },
  timeId: {
    required: true,
    message: $i18n.t('validation.is_required', {
      field: $i18n.t('time')
    }),
    validator: (rule: any, value: number[]) => {
      return value && value.length > 0;
    },
    trigger: ['blur', 'change']
  }
};

const getBookingDate = (): number => {
  if (props.booking?.bookingDate) {
    return Date.parse(props.booking?.bookingDate);
  }
  return Date.now();
};

const formData = ref<Booking>({
  id: props.booking?.id,
  customer: props.booking?.customer,
  phone: props.booking?.phone,
  bookingAt: getBookingDate(),
  timeId: (props.booking?.times?.map(time => time.time!.id) ??
    []) as number[],
  courtId: props.booking?.court?.id,
  price: props.booking?.price
});

watch(() => formData.value.bookingAt, (v) => {
  if (formData.value.courtId) {
    onSelectCourt(formData.value.courtId ?? props.booking?.courtId)
  }
},
  { immediate: true }
)

watch(
  () => formData,
  (newValue, oldValue) => {
    if (newValue.value.timeId) {
      total.value = times.value.reduce((p, c) => {
        let price = 0;
        if (newValue.value.timeId!.includes(c.id!)) {
          price = +c.time.price!;
        }
        console.log(price);

        return p + price * 1;
      }, 0);

      const price = Number(formData.value.price ?? 0);
      const calculatedTotal = Number(total.value ?? 0);
      // Guard against division by zero
      const percent = calculatedTotal !== 0 ? (price / calculatedTotal) * 100 : 0;
      formData.value.bookPercent =percent;
    }
  },
  { immediate: true }
);

const createCategory = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      const result = await updateBooking({
        id: formData.value.id,
        status: SaleStatus.Cancelled
      });
      const added = await createBooking({
        ...formData.value,
        id: undefined
      });
      emit('updated', result);
      emit('added', added);
      resetForm();
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
};

const resetForm = () => {
  isEditing.value = false;
};
</script>
