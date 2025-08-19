<template>
  <n-card :title="$t('product')" class="dark-mode-card col-span-3" style="height: 600px;">
    <div ref="productGrid" test class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-1">
      <div v-for="(product, i) in products" :key="product.id" :data-testid="'products-sale' + i"
        class="flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
        :class="{ 'animate-pulse': clickedProduct === product.id }" @click="() => selectAddQty(product)"
        @mousedown="handleMouseDown(product.id!)" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
        <img :src="product.img" class="w-24 h-24 object-cover rounded-lg mb-2" />
        <p class="text-center text-sm">{{ product.name }}</p>
      </div>
    </div>
    <div v-if="loading" class="text-center py-4">
      <n-spin size="medium" />
    </div>
    <n-modal :show="!!selectedProduct" style="width: 450px; " :title="$t('transaction')">
      <dialog-qty v-if="selectedProduct" :name="selectedProduct.name" :price="0"
        @close="() => selectedProduct = null" @confirm="addItem" :varients="selectedProduct.varients"</dialog-qty>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
import { NCard, NSpin, useNotification, NModal } from 'naive-ui'
import { fetchProducts } from '~/api'
import type { Product, SaleItem, Varient } from '~/models'
const selectedProduct = ref<Product | null>();

const products = ref<Product[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 12
const hasMore = ref(true)
const productGrid = ref<HTMLElement | null>(null)
const clickedProduct = ref<number | null>(null)
const notification = useNotification()

const emit = defineEmits(['add', 'remove', 'update'])
const props = defineProps<{
  categoryId?: number,
  brandId?: number,
  shopId?: number,
}>()

const fetchProductsData = async () => {
  if (!hasMore.value || loading.value) return
  loading.value = true
  try {
    const { data: results, meta } = await fetchProducts({
      page: page.value,
      pageSize,
      shopId: props.shopId,
      catagoryId: props.categoryId,
      brandId: props.brandId,
    })
    products.value = [...products.value, ...results]
    hasMore.value = results.length === pageSize
    page.value++
  } catch (error) {
    console.error('Error fetching products:', error)
    notification.error({
      title: 'Error',
      content: 'Failed to fetch products. Please try again.',
    })
  } finally {
    loading.value = false
  }
}


onMounted(() => {
  fetchProductsData()
})


const selectAddQty = (product: Product) => {
  selectedProduct.value = product;
}

const addItem = (qty: number, note: string, varient: Varient) => {
  const product = selectedProduct.value;

  const item: SaleItem = {
    productId: product!.id,
    qty: qty,
    name: product!.name ?? "",
    price: varient.price,
    note,
    varientId: varient.id,
  };

  emit('add', item)
  notification.success({
    title: 'Added to Cart',
    content: `${product?.name} has been added to your cart.`,
    duration: 1000,
  })
  selectedProduct.value = null;
}

const handleMouseDown = (productId: number) => {
  clickedProduct.value = productId
}

const handleMouseUp = () => {
  clickedProduct.value = null
}

watch(() => [props.categoryId, props.brandId], () => {
  page.value = 1
  hasMore.value = true
  loading.value = false
  products.value = []
  fetchProductsData()
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}
</style>