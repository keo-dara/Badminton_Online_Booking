<template>
    <n-card :title="$t('stock')" class="dark-mode-card">
      <n-form ref="formRef" :model="newStock" :rules="rules">
        <n-form-item path="quantity" :label="$t('quantity')">
          <n-input-number v-model:value="newStock.quantity" @keydown.enter.prevent :placeholder="$t('quantity')" />
        </n-form-item>
        <n-text style="font-size: 16px">
          {{ $i18n.t('type') }}
        </n-text>
        <n-select v-model:value="newStock.type" filterable placeholder="Please select a stock" :options="options"
          class="pb-6 pt-2" />
        <n-button data-testid="submit-user-info" round @click="submitForm" type="success">
          {{ $t('create') }}
        </n-button>
      </n-form>
    </n-card>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { NButton, NCard, NForm, NFormItem, NSelect, NInputNumber, useNotification } from 'naive-ui';
import { createStock } from '~/api';
import { Stocktype, type Stock } from '~/models';

const { $i18n } = useNuxtApp()
const formRef = ref<FormInst | null>(null);

const props = defineProps<{
  varientId?: number
}>()

const emit = defineEmits(['added'])

const rules = {
  quantity: {
    required: true,
  },
}

const options = [
  {
    label: $i18n.t('in'),
    value: Stocktype.In
  },
  {
    label: $i18n.t('out'),
    value: Stocktype.Out
  },
]

const newStock = ref<Stock>({})
const notification = useNotification();

const submitForm = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      const result = await createStock({
        ...newStock.value,
        varientId: props.varientId,
      });
      emit('added', result);
      notification.success({
        content: 'Stock add successfully',
        title: "Message",
        duration: 1000
      })
      resetForm();
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
}

const resetForm = () => {
  newStock.value.quantity = 0;
}
</script>
