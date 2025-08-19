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
      <n-date-picker :disabled="!!props.booking" :default-value="Date.now()" v-model:value="formData.bookingAt"
        type="date" :placeholder="$t('startDate')" :is-date-disabled="(timestamp: number) => timestamp < yesterday" />
    </n-form-item>
    <n-form-item path="court" :label="$t('court')">
      <n-select :disabled="!!props.booking" :loading="courtAsync.status.value === 'pending'"
        v-model:value="formData.courtId" filterable placeholder="Please select a court" :options="courtAsync.data.value!.data.map((court) => {
          return {
            label: court.name,
            value: court.id!,
          }
        })" class="pt-2" :max-tag-count="3" @change="onSelectCourt" @update-value="onSelectCourt" />
    </n-form-item>

    <n-form-item path="timeId" :label="$t('time')">
      <div class="grid lg:grid-cols-3 md:grid-cols-4 grid-cols-3 gap-3 w-full">
        <div v-if="courtAsync.status.value !== 'pending' && !times.length">
          <p class="text-gray-400">Court has no time</p>
        </div>
        <div v-if="courtAsync.status.value !== 'pending'" v-for="gTime in times">
          <n-button v-if="gTime.time.id" class="w-full" :disabled="props.booking?.id != null" :type="formData.timeId && formData.timeId.includes(gTime.time.id)
            ? 'primary'
            : 'default'
            " :ghost="formData.timeId && formData.timeId.includes(gTime.time.id)
              ? false
              : true
              " :secondary="formData.timeId && formData.timeId.includes(gTime.time.id)
                ? true
                : false
                " @click="() => {
                  const index =
                    formData.timeId!.findIndex(id => id == gTime.time.id) ?? -1;

                  if (index != -1) {
                    formData.timeId!.splice(index, 1);
                  } else {
                    formData.timeId!.push(gTime.time.id!);
                  }
                }
                  ">
            {{
              gTime.displayTime
            }}
          </n-button>
        </div>
      </div>
    </n-form-item>


    <div class="flex flex-row mb-6 space-x-4" v-if="!isEditing">
      <n-button @click="() => formData.bookPercent = percent" v-for="percent in percentsBooking"
        :type="percent === formData.bookPercent ? 'primary' : 'info'">{{
          percent }}%</n-button>
    </div>


    <n-form-item path="bookPercent" label="Book Percent" v-if="isEditing">
      <n-input-number disabled v-model:value="formData.bookPercent" @keydown.enter.prevent placeholder="Pay Percent" />
    </n-form-item>

    <n-button :disabled="!!!formData.courtId" data-testid="submit-user-info" round @click="createCategory"
      type="success">
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

const formRef = ref<FormInst | null>(null);
const emit = defineEmits(['added', 'updated']);
const { $i18n } = useNuxtApp();
const isEditing = ref(!!props.booking);
const times = ref<Availability[]>([]);
const notification = useNotification();

const percentsBooking = [0, 20, 50, 100];

const autocompletedOption = ref<
  { label: string; value: string; customer: string }[]
>([]);

onMounted(() => {
  if (props.booking?.court?.id) onSelectCourt(props.booking.court.id);
});

const onSelectCourt = async (courtId: number) => {
  times.value = await fetchCourtPublic(courtId, formData?.value.bookingAt ?? Date.now());
  times.value = sortAvailabilities(times.value);
};

const courtAsync = await useAsyncData('timecourt', () =>
  fetchCourts({
    page: 1,
    pageSize: 20
  })
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
    }),
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
  bookPercent: 20
});

watch(() => formData.value.bookingAt, (v) => {
  if(formData.value.courtId)
  onSelectCourt(formData.value.courtId)
})

const createCategory = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      if (!props.booking) {
        const result = await createBooking({
          ...formData.value
        });
        const updated = await updateBooking({
          id: result.id,
          status: SaleStatus.Paid,
        });
        updated.court = result.court;
        emit('added', updated);
        notificationSuccess(notification);
      } else {
        const result = await updateBooking({
          ...formData.value
        });
        emit('updated', result);
      }
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
