<template>
  <div class="mx-auto p-8 ">
    <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
      @update:page="handlePageChange" :loading="isLoading" />
  </div>

</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NDataTable, NSpace, NText, useDialog, useNotification } from 'naive-ui'
import { fetchSales, removeSale } from '~/api';
import { SaleStatus, type Sale } from '~/models';

const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Sale>()


onMounted(async () => {
  initdata()
})

const initdata = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchSales(
    {
      ...pagination as PaginationProps,
      status: SaleStatus.Draft,
      ignoreDraft: false
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
  const { data: results, meta } = await fetchSales(
    {
      ...pagination as PaginationProps,
      status: SaleStatus.Draft,
      ignoreDraft: false
    },
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const emiter = defineEmits(['update', 'delete'])

const columns: DataTableColumns<Sale> = [
  {
    title: "No",
    key: 'no',
  },
  {
    title: $i18n.t('status'),
    key: 'status',
  },
  {
    title: $i18n.t('payment'),
    key: 'paymentType',
  },
  {
    title: $i18n.t('tax'),
    key: 'tax',
  },
  {
    title: $i18n.t('discount'),
    key: 'discount',
  },
  {
    title: $i18n.t('total'),
    key: 'total',
  },
  {
    title: $i18n.t('date'),
    key: 'createdAt',
    render(rowData) {
      return h(NText, formatDateNotime(rowData.createdAt!),)
    },
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
              { default: () => $i18n.t('continue'), }
            ),
            h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                type: 'error',
                onClick: async () => {
                  handleDelete(row);
                },
              },
              { default: () => $i18n.t('delete'), }
            ),
          ],
        }
      )
    },
  },
]

const dialog = useDialog();
const notification = useNotification();

const handleDelete = (sale: Sale) => {
  const d = dialog.warning({
    title: 'Delete',
    content: `Do you want to remove sale no: ${sale.no} ?`,
    positiveText: 'Confirm',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await removeSale(sale.id!);
        data.value = data.value.filter((o) => o.id !== sale?.id);
        return;
      } catch (error) {
        notificationHttpError(error, notification);
      }
    }
  })
}

</script>
