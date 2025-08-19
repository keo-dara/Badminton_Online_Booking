<template>
    <n-card :title="isEditing ? 'Edit Shop' : $t('addNewShop')" class="dark-mode-card">
      <n-form ref="formRef" :model="newCategory" :rules="rules">
        <n-form-item path="name" :label="$t('name')">
          <n-input v-model:value="newCategory.name" @keydown.enter.prevent :placeholder="$t('name')" />
        </n-form-item>
        <n-form-item path="address" :label="$t('address')">
          <n-input v-model:value="newCategory.address" @keydown.enter.prevent :placeholder="$t('address')" />
        </n-form-item>
        <n-form-item path="phone" :label="$t('phone')">
          <n-input v-model:value="newCategory.phone" @keydown.enter.prevent :placeholder="$t('phone')" />
        </n-form-item>
        <n-button data-testid="submit-user-info" round @click="submitForm" type="success">
          {{ isEditing ? $t('update') : $t('create') }}
        </n-button>
      </n-form>
    </n-card>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { NButton, NCard, NForm, NFormItem, NInput, useNotification } from 'naive-ui';
import { createShop, updateShop } from '~/api';
import type { Shop } from '~/models';

const formRef = ref<FormInst | null>(null);

const props = defineProps<{
  shop?: Shop
}>()


const emit = defineEmits(['shop-added', 'shop-updated'])

const rules = {
  name: {
    required: true,
    message: 'Please input the shop name',
    trigger: 'blur'
  },
  phone: {
    required: true,
    message: 'Please input the shop name',
    trigger: 'blur'
  },
  address: {
    required: true,
    message: 'Please input the phone name',
    trigger: 'blur'
  }
}

const newCategory = ref<Shop>({
  id: props.shop?.id,
  name: props.shop?.name ?? '',
  address: props.shop?.address ?? '',
  phone: props.shop?.phone ?? '',
})

const isEditing = ref(!!props.shop)
const notification = useNotification();


const submitForm = async (e: MouseEvent) => {

  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {

      if (!props.shop) {
        const result = await createShop(newCategory.value);
        emit('shop-added', result);
        notification.success({
          content: 'Shop created successfully',
          title: "Message",
          duration: 1000
        })
      } else {
        const result = await updateShop({
          id: newCategory.value.id!,
          name: newCategory.value.name,
          phone: newCategory.value.phone,
          address: newCategory.value.address,
        });
        emit('shop-updated', result);
      }
      resetForm();
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
}

const resetForm = () => {
  newCategory.value.id = undefined
  newCategory.value.name = ''
  newCategory.value.address = ''
  newCategory.value.phone = ''
  isEditing.value = false
}
</script>
