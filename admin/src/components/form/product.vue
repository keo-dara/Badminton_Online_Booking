<template>
  <div>
    <n-card :title="isEditing ? 'Edit Product' : $i18n.t('addNewProduct')" class="dark-mode-card"
      @keydown.enter.prevent="submitForm">
      <n-form ref="formRef" :model="newProduct" :rules="rules">
        <n-form-item path="name" :label="$t('name')">
          <n-input v-model:value="newProduct.name" :placeholder="$t('name')" />
        </n-form-item>
        <!-- <n-form-item path="description" :label="$t('description')">
          <n-input v-model:value="newProduct.description" :placeholder="$t('description')" />
        </n-form-item> -->
        <n-text style="font-size: 16px">
          {{ $i18n.t('category') }}
        </n-text>

        <n-select :loading="categories.length === 0" v-model:value="newProduct.catalogId" filterable
          placeholder="Please select a categories" :options="categories.map((category) => {
            return {
              label: category.name,
              value: category.id
            }
          })" class="pb-6 pt-2" />
        <n-text style="font-size: 16px">
          {{ $i18n.t('brand') }}
        </n-text>
        <n-select :loading="brands.length === 0" v-model:value="newProduct.brandId" filterable
          placeholder="Please select a brand" :options="brands.map((brand) => {
            return {
              label: brand.name,
              value: brand.id
            }
          })" class="pb-6 pt-2" />
        <upload-images :img-url="newProduct.img" @upload-success="(r) => newProduct.img = r" />
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
import { createProduct, fetchBrand, fetchCategories, updateProduct } from '~/api';
import type { Brand, Category, Product, Shop } from '~/models';


const categories = ref<Category[]>([])
const brands = ref<Brand[]>([])

const fetchCategoriesData = async () => {
  categories.value = (await fetchCategories({ page: 1, pageSize: 100 })).data
  brands.value = (await fetchBrand({ page: 1, pageSize: 100 })).data
}

onMounted(fetchCategoriesData)

const { $i18n } = useNuxtApp()
const formRef = ref<FormInst | null>(null);
const emit = defineEmits(['product-added', 'product-updated', 'close'])
const props = defineProps<{
  product?: Product
  shop?: Shop
}>()


const rules = {
  name: {
    required: true,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("name"),
    }),
  },
  description: {
    required: false,
    message: $i18n.t("validation.is_required", {
      field: $i18n.t("description"),
    }),
  },

}

const newProduct = ref<Product>({
  id: props.product?.id,
  name: props.product?.name ?? '',
  description: props.product?.description ?? '',
  img: props.product?.img,
  catalogId: props.product?.catalog?.id,
  brandId: props.product?.brand?.id
})

const isEditing = ref(!!props.product)
const notification = useNotification();


const submitForm = async (e: MouseEvent) => {

  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {

      if (!props.product) {

        const result = await createProduct({
          ...newProduct.value,
          shopId: props.shop?.id
        });
        emit('product-added', result);
        notification.success({
          content: 'Product created successfully',
          title: "Message",
          duration: 1000
        })
      } else {
        const result = await updateProduct({
          ...newProduct.value,
          shopId: props.shop?.id
        });
        emit('product-updated', result);
        notification.success({
          content: 'Product update successfully',
          title: "Message",
          duration: 1000
        })
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
  newProduct.value.description = ''
  isEditing.value = false
}
</script>
