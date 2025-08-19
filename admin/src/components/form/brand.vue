<template>
  <div>
    <n-card :title="isEditing ? $t('editBrand') : $t('addBrand')" class="dark-mode-card">
      <n-form ref="formRef" :model="newCategory" :rules="rules" @keydown.enter.prevent="createCategory">
        <n-form-item path="name" :label="$t('name')">
          <n-input v-model:value="newCategory.name" @keydown.enter.prevent :placeholder="$t('name')" />
        </n-form-item>
        <n-button data-testid="submit-user-info" round @click="createCategory" type="success">
          {{ isEditing ? $t('update') : $t('create') }}
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { NButton, NCard, NForm, NFormItem, NInput, useNotification } from 'naive-ui';
import { createBrand, updateBrand } from '~/api';
import type { Category } from '~/models';

const props = defineProps<{
  category?: Category
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
  }
}

const newCategory = ref<{ id: number | null; name: string }>({
  id: props.category?.id ?? null,
  name: props.category?.name ?? '',
})

const createCategory = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      if (!props.category) {
        const result = await createBrand({
          name: newCategory.value.name
        });
        emit('added', result);
        notificationSuccess(notification);
      } else {
        const result = await updateBrand({
          id: newCategory.value.id!,
          name: newCategory.value.name
        });
        emit('updated', result);
      }
      resetForm();
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
}

const resetForm = () => {
  newCategory.value.id = null
  newCategory.value.name = ''
  isEditing.value = false
}
</script>
