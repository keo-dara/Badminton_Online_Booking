<template>
  <div>
    <n-card :title="isEditing ? $i18n.t('edit') : $i18n.t('add')" class="dark-mode-card"
      @keydown.enter.prevent="submitForm">
      <n-form ref="formRef" :model="newProduct" :rules="rules">
        <n-form-item data-testid="p-name" path="name" :label="$i18n.t('name')">
          <n-input v-model:value="newProduct.name" :placeholder="$i18n.t('name')" @change="generateCodeFromName" />
        </n-form-item>
        <n-form-item data-testid="p-price" path="price" :label="$t('price')">
          <n-input-number v-model:value="newProduct.price" :placeholder="$t('price')" />
        </n-form-item>
        <n-form-item path="code" :label="$t('code')">
          <n-input v-model:value="newProduct.code" :placeholder="$t('code')" />
        </n-form-item>

        <!-- <n-form-item path="discountPrice" :label="$t('discountPrice')">
          <n-input-number v-model:value="newProduct.discountPrice" :placeholder="$t('discountPrice')" />
        </n-form-item> -->


        <n-button data-testid="submit-user-info" round @click="onClose" type="default">
          {{ $t('cancel') }}
        </n-button>
        <n-button data-testid="submit-product-info" round @click="submitForm" type="success" class="ml-4">
          {{ isEditing ? $t('update') : $t('create') }}
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { NButton, NCard, NForm, NFormItem, NSelect, NInput, NInputNumber, useNotification } from 'naive-ui';
import { createProduct, createVarient, updateProduct, updateVarient } from '~/api';
import type { Varient } from '~/models';



const { $i18n } = useNuxtApp()
const formRef = ref<FormInst | null>(null);
const emit = defineEmits(['added', 'updated', 'close'])
const props = defineProps<{
  varient?: Varient
  productId?: number
}>()


const rules = {
  name: {
    required: true,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("name"),
    }),
  },
  code: {
    required: true,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("code"),
    }),
  },
  description: {
    required: false,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("description"),
    }),
  },
  price: {
    required: true,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("price"),
    }),
  },
  discountPrice: {
    required: false,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("discount"),
    }),
  }
}

const newProduct = ref<Varient>({
  id: props.varient?.id,
  name: props.varient?.name ?? '',
  code: props.varient?.code ?? '',
  price: props.varient?.price,
})

const isEditing = ref(!!props.varient)
const notification = useNotification();

const generateCodeFromName = (name: string) => {

  if (isEditing.value) {
    return;
  }

  // Remove spaces and convert to lowercase
  const code = name.replace(/\s+/g, '').toLowerCase();

  // Take the first 6 characters
  const truncatedCode = code.slice(0, 6);

  // Add a random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Combine the truncated code and random number
  newProduct.value.code = `${truncatedCode}${randomNumber}`;
}

const submitForm = async (e: MouseEvent) => {

  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {

      if (!props.varient) {
        const result = await createVarient({
          ...newProduct.value,
          productId: props.productId
        });
        emit('added', result);
        notificationSuccess(notification);
      } else {
        const result = await updateVarient({
          ...newProduct.value,
        });
        emit('updated', result);
        notificationSuccess(notification);
      }

      resetForm();
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }

}

const onClose = () => {

  emit('close')
}

const resetForm = () => {
  newProduct.value.id = undefined
  newProduct.value.name = ''
  newProduct.value.price = null;
  newProduct.value.code = ''
  isEditing.value = false
}
</script>
