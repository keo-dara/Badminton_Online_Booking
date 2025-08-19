<template>
  <div class="mx-auto p-8 ">
    <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
      @update:page="handlePageChange" :loading="isLoading" />
  </div>

</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NDataTable, NSpace, NText, useDialog, useNotification } from 'naive-ui'
import { fetchBrand, fetchCustomer } from '~/api';
import { type Customer, type Sale } from '~/models';

const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Customer>()


onMounted(async () => {
  initdata()
})

const initdata = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchCustomer(
    {
      ...pagination as PaginationProps,
    },

  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

async function handlePageChange(currentPage: number) {
  isLoading.value = true
  pagination.page = currentPage;
  const { data: results, meta } = await fetchBrand(
    {
      ...pagination as PaginationProps,
    },
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}


const emiter = defineEmits(['update'])


const columns: DataTableColumns<Sale> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: $i18n.t('name'),
    key: 'name',
  },
  {
    title: $i18n.t('phone'),
    key: 'phone',
  },
  {
    title: $i18n.t('action'),
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                type: 'info',
                onClick: async () => {
                  emiter('update', row)
                },
              },
              { default: () => $i18n.t('choose'), }
            ),
          ],
        }
      )
    },
  },
]


</script>
