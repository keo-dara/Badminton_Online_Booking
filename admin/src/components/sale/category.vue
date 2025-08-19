<template>
  <n-card :title="$t('category')" class="dark-mode-card col-span-2 w-full">
    <template #header-extra>
      <!-- <n-button tertiary round>
        <Icon name="solar:round-alt-arrow-down-linear" />
      </n-button> -->
    </template>
    <div class="overflow-x-auto">
      <div class="flex flex-row gap-2 pb-2">
        <div @click="selectCategory(-1)" class="flex-shrink-0 cursor-pointer">
          <p class="px-3 rounded-2xl text-white" :class="selectedIndex === -1 ? 'bg-blue-600' : 'bg-slate-600'">
            {{ $t('all') }}
          </p>
        </div>
        <div v-for="(category, index) in asyncCategory.data.value?.data" :key="category.id"
          @click="selectCategory(index)" class="flex-shrink-0 cursor-pointer">
          <p class="px-3 rounded-2xl text-white" :class="index === selectedIndex ? 'bg-blue-600' : 'bg-slate-600'">
            {{ category.name }}
          </p>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
import { NCard, NButton } from "naive-ui";
import { fetchCategories } from "~/api";

const selectedIndex = ref(-1)

const emit = defineEmits(['select', 'openDialog'])

const selectCategory = (index: number) => {
  selectedIndex.value = index

  if (index != -1) {
    emit('select', asyncCategory.data.value?.data[index].id)
  } else {
    emit('select', undefined)
  }
}

const asyncCategory = await useAsyncData(
  'category',
  () => fetchCategories({
    page: 1,
    pageSize: 100
  })
);
</script>