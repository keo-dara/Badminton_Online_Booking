<template>
  <n-card class="rounded-lg shadow-md max-w-md mx-auto">
    <div class="flex justify-between items-center mb-4">
      <n-text>{{ name }}</n-text>
      <n-text :strong="true" v-if="!varients">${{ (quantity * price!).toFixed(2) }}</n-text>
      <n-text :strong="true" v-if="varients">${{ (quantity * (selectedVariant?.price ?? 0)).toFixed(2) }}</n-text>
    </div>

    <div class="mb-4" v-if="varients">
      <n-text class="block mb-2">{{ $t('varient') }}</n-text>
      <div class="grid grid-cols-2 gap-2">
        <n-button v-for="variant in varients" :key="variant.id"
          :type="selectedVariantId === variant.id ? 'primary' : 'default'" @click="updateSelectedVariant(variant.id!)"
          class="text-left">
          <div>{{ variant.name }}</div>
          <!-- <div class="text-sm">${{ variant.price!.toFixed(2) }}</div> -->
        </n-button>
      </div>
    </div>

    <div class="mb-2">
      <n-text>{{ $t('quantity') }}</n-text>
      <div class="flex">
        <button data-testid="decrease-qty" class="bg-gray-400 px-4 py-2 rounded-l" @click="decrementQuantity">-</button>
        <input data-testid="qty-input-value" type="number" v-model="quantity"
          class="w-full text-black text-center border-t border-b select-none" readonly />
        <button data-testid="increase-qty" class="bg-gray-400 px-4 py-2 rounded-r" @click="incrementQuantity">+</button>
      </div>
    </div>
    <div class="mb-4">
      <n-text>{{ $t('note') }}</n-text>
      <textarea v-model="note" class="w-full border rounded p-2 text-black" rows="3"></textarea>
    </div>
    <div class="w-full flex gap-2">
      <n-button data-testid="close-change-qty" type="warning" @click="onClose">{{ $t('close') }}</n-button>
      <n-button v-if="varients" data-testid="add-qty" :disabled="!selectedVariant || quantity < 1 && !!!props.qty"
        type="info" class="flex-grow" @click="onConfirm">{{
          $t('add')
        }}</n-button>
      <n-button v-if="!varients" data-testid="add-qty" :disabled="quantity < 1 && !!!props.qty" type="info"
        class="flex-grow" @click="onConfirm">{{
          $t('add')
        }}</n-button>

    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NButton, NText, NCard, } from 'naive-ui';
import type { Varient } from '~/models';

const emiter = defineEmits(['confirm', 'close'])
const props = defineProps<{
  name?: string,
  qty?: number
  price?: number
  note?: string,
  varients?: Varient[]
}>()

const quantity = ref(props.qty ?? 0)
const note = ref(props.note)

const selectedVariantId = ref<number>()
const selectedVariant = computed(() =>
  props.varients?.find(variant => variant.id === selectedVariantId.value)
)

const updateSelectedVariant = (variantId: number) => {
  selectedVariantId.value = variantId
}
const incrementQuantity = () => {
  quantity.value++
}
const decrementQuantity = () => {
  if (quantity.value > 0) {
    quantity.value--;
  }
}
const onConfirm = () => {
  emiter('confirm', quantity.value, note.value, selectedVariant.value);
}
const onClose = () => {
  emiter('close')
}
</script>