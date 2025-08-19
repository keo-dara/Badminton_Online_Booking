<template>
  <n-card :title="isEditing ? $t('editCustomer') : $t('addCustomer')" class="dark-mode-card">
    <n-form ref="formRef" :model="formData" :rules="rules" @keydown.enter.prevent="createCategory">
      <n-form-item path="name" :label="$t('name')">
        <n-input v-model:value="formData.name" @keydown.enter.prevent :placeholder="$t('name')" />
      </n-form-item>
      <n-form-item path="phone" :label="$t('phone')">
        <n-input v-model:value="formData.phone" @keydown.enter.prevent :placeholder="$t('phone')" />
      </n-form-item>
      <n-button data-testid="submit-user-info" round @click="createCategory" type="success">
        {{ isEditing ? $t('update') : $t('create') }}
      </n-button>
    </n-form>
  </n-card>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { NButton, NCard, NForm, NFormItem, NInput, useNotification } from 'naive-ui';
import { createCustomer, updateCustomer } from '~/api';
import type { Customer } from '~/models';

const props = defineProps<{
  category?: Customer
}>()

const formRef = ref<FormInst | null>(null);
const emit = defineEmits(['added', 'updated'])
const { $i18n } = useNuxtApp()
const isEditing = ref(!!props.category)
const notification = useNotification();


const rules = {
  name: {
    required: true,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("name"),
    }),
  },
  phone: {
    required: true,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("phone"),
    }),
  }
}

const formData = ref<Customer>({
  id: props.category?.id ?? null,
  name: props.category?.name ?? '',
  phone: props.category?.phone ?? '',
})

const createCategory = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      if (!props.category) {
        const result = await createCustomer(formData.value);
        emit('added', result);
        notificationSuccess(notification);
      } else {
        const result = await updateCustomer(formData.value);
        emit('updated', result);
      }
      resetForm();
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
}

const resetForm = () => {
  formData.value.id = null
  formData.value.name = ''
  formData.value.phone = ''
  isEditing.value = false
}
</script>
