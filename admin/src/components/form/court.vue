<template>
  <n-form ref="formRef" :model="newCategory" :rules="rules" @keydown.enter.prevent="onSubmit">
    <n-form-item path="name" :label="$t('name')">
      <n-input v-model:value="newCategory.name" @keydown.enter.prevent :placeholder="$t('name')" />
    </n-form-item>
    <n-form-item path="description" :label="$t('description')">
      <n-input v-model:value="newCategory.description" @keydown.enter.prevent :placeholder="$t('description')" />
    </n-form-item>
    <n-form-item path="discount" :label="$t('discount')">
      <n-input-number v-model:value="newCategory.discount" @keydown.enter.prevent :placeholder="$t('discount')" />
    </n-form-item>
    <div class="flex flex-row ">
      <p class="pr-4">VIP: </p>
      <n-switch v-model:value="isVip" />
    </div>

    <n-form-item path="name" :label="$t('time')" class="mt-4">
      <div class="grid lg:grid-cols-3 md:grid-cols-4 grid-cols-3 gap-3 w-full">
        <div v-if="timesAsync.status.value !== 'pending'" v-for="time in getTimes()">
          <n-button class="w-full" :type="newCategory.timeId!.includes(time.id!) ? 'primary' : 'default'"
            :ghost="newCategory.timeId!.includes(time.id!) ? false : true"
            :secondary="newCategory.timeId!.includes(time.id!) ? true : false" @click="() => {
              const index =
                newCategory.timeId!.findIndex(id => id == time.id) ?? -1;

              if (index != -1) {
                newCategory.timeId!.splice(index, 1);
              } else {
                newCategory.timeId!.push(time.id!);
              }
            }
              ">
            <p :class="time.isVip ? 'text-yellow-500' : ' text-green-500'">
              {{
                displayBookingTime(time.from!, time.to!, time.shift!.toString())
              }}
            </p>
          </n-button>
        </div>
      </div>
    </n-form-item>
    <n-form-item path="name" :label="$t('active')">
      <n-switch v-model:value="newCategory.enable!" class="mt-4" @update:value="toggleEnable">
        {{ $t('enableTwoFactor') }}
      </n-switch>
    </n-form-item>
    <n-button data-testid="submit-user-info" round @click="onSubmit" type="success">
      {{ isEditing ? $t('update') : $t('create') }}
    </n-button>
  </n-form>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  useNotification,
  NSwitch,
  NInputNumber
} from 'naive-ui';
import { createCourt, fetchTimes, updateCourt } from '~/api';
import type { Court } from '~/models';

const props = defineProps<{
  category?: Court;
}>();
const isVip = ref(false);
const formRef = ref<FormInst | null>(null);
const emit = defineEmits(['added', 'updated']);
const { $i18n } = useNuxtApp();
const isEditing = ref(!!props.category);
const notification = useNotification();

const timesAsync = await useAsyncData('time', () =>
  fetchTimes({
    page: 1,
    pageSize: 95
  })
);

const getTimes = () => {
  const filteredData = timesAsync.data.value?.data.filter((t) => t.isVip === isVip.value);
  return sortTimes(filteredData ?? []);
}

const rules = {
  name: {
    required: true,
    message: $i18n.t('validation.is_required', {
      field: $i18n.t('name')
    })
  },
  description: {
    required: true,
    message: $i18n.t('validation.is_required', {
      field: $i18n.t('description')
    })
  }
};

const toggleEnable = (value: boolean) => {
  newCategory.value.enable = value;
};

const newCategory = ref<Court>({
  id: props.category?.id ?? null,
  name: props.category?.name ?? '',
  description: props.category?.description ?? '',
  timeId: (props.category?.times?.map(time => time!.id) ?? []) as number[],
  enable: props.category?.enable ?? true,
  discount: props.category?.discount ?? 0,
});

const onSubmit = async (e: MouseEvent) => {
  e.preventDefault();

  if (await formRef.value?.validate()) {
    const isPass = validateTimes();

    if (!isPass) {
      return;
    }

    try {
      if (!props.category) {
        const result = await createCourt(newCategory.value);
        emit('added', result);
        notificationSuccess(notification);
      } else {
        const result = await updateCourt({
          id: newCategory.value.id!,
          ...newCategory.value
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
  newCategory.value.id = null;
  newCategory.value.name = '';
  isEditing.value = false;
  newCategory.value.times = [];
};

// Validate times cant empty
// true pass
const validateTimes = (): boolean => {
  if (!newCategory.value.timeId) {
    notification.info({
      content: `Times can not be empty`,
      duration: 1000
    });
    return false;
  }

  if (newCategory.value.timeId.length === 0) {
    notification.info({
      content: `Times can not be empty.`,
      duration: 1000
    });
    return false;
  }

  return true;
};
</script>
