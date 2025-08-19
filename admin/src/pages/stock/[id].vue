<template>
  <div class=" h-screen p-1">
    <BackHeader :title="$t('stock')">
      <div class="lg:flex lg:space-x-4">
        <div class="lg:w-2/3 mb-4 lg:mb-0">
          <n-card :title="$t('management') + $t('shop')" class="dark-mode-card">
            <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
              @update:page="handlePageChange" :loading="isLoading" />
          </n-card>
        </div>
        <div class="lg:w-1/3">
          <form-stock @added="onAdded" :varient-id="varientId" ></form-stock>
        </div>
      </div>
    </BackHeader>
  </div>

</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NCard, NDataTable, NTag, NText } from 'naive-ui'
import { fetchStocks } from '~/api';
import type { Shop, Stock } from '~/models';

let varientId = ref(0);
const route = useRoute()
const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Shop>()

onMounted(async () => {
  varientId.value = Number(route.params.id);
  initdata()
})

const initdata = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchStocks(
    { ...pagination as PaginationProps, varientId: varientId.value, },
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

async function handlePageChange(currentPage: number) {
  isLoading.value = true
  pagination.page = currentPage;
  const { data: results, meta } = await fetchStocks(
    { ...pagination as PaginationProps, varientId: varientId.value, },
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const onAdded = (shop: Stock) => {
  data.value.push(shop)
}

const columns: DataTableColumns<Stock> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: $i18n.t('type'),
    key: 'type',
    render(rowData) {
      return h(NTag, { bordered: false, type: "info" }, rowData.type?.toLocaleUpperCase())
    },
  },
  {
    title: $i18n.t('quantity'),
    key: 'quantity',
  },
  {
    title: $i18n.t('date'),
    key: 'createdAt',
    render(row) {
      return h(NText, formatDate(row.createdAt!))
    }
  },
  {
    title: $i18n.t('sale'),
    key: 'createdBy.userName',
  },
]

</script>
