<template>
  <div class="mx-auto p-1 ">
    <div class="flex flex-row gap-1">
      <n-card class="mb-1 dark-mode-card" :title="$t('search')">
        <div class="flex flex-row gap-1 ">
          <n-input v-model:value="query" :placeholder="$t('search') + $t('shop')" class="mb-4" :clearable="true">
            <template #prefix>
              <Icon name="ion:search-outline" />
            </template>
          </n-input>
          <n-button @click="onSearch" type="tertiary">
            {{ $t('search') }}
          </n-button>
        </div>
      </n-card>
      <n-card class="mb-1 dark-mode-card w-1/3">
        <n-statistic :label="$t('total')" :value="pagination.itemCount" suffix="items" />
      </n-card>
    </div>

    <div class="lg:flex lg:space-x-1">

      <!-- Category Table -->
      <div class="lg:w-2/3 mb-1 lg:mb-0">
        <n-card :title="addingSpace($t('management'), $t('shop'))" class="dark-mode-card">
          <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
            @update:page="handlePageChange" :loading="isLoading" />
        </n-card>
      </div>

      <!-- Add/Edit Category Form -->
      <div class="lg:w-1/3">
        <form-shop @shop-added="onCategoryAdded"></form-shop>
      </div>

    </div>

    <n-modal :show="!!showQrScanner" style="width: 500px; height: 500px;" :title="$t('uploadQR')" preset="card"
      @close="() => showQrScanner = undefined">
      <app-qr-scanner :id="showQrScanner!" @update="() => showQrScanner = undefined"> </app-qr-scanner>
    </n-modal>


    <n-modal :show="!!updateCategory" style="width: 500px;">
      <form-shop @shop-updated="onCategoryUpdate" :shop="updateCategory"></form-shop>
    </n-modal>

  </div>
</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NStatistic, NSpace, NModal, NCard, NDataTable, NInput, useDialog, useNotification } from 'naive-ui'
import { fetchShops, removeShop, updateShop } from '~/api';
import type { Shop } from '~/models';


const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Shop>()
const query = ref<string>()
const updateCategory = ref<Shop>();
const showQrScanner = ref<number | null>()

onMounted(async () => {
  initdata()
})

const initdata = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchShops(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

async function handlePageChange(currentPage: number) {
  isLoading.value = true
  pagination.page = currentPage;
  const { data: results, meta } = await fetchShops(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const onCategoryAdded = (shop: Shop) => {
  data.value.push(shop)
}
const onCategoryUpdate = (category: Shop) => {
  const index = data.value.findIndex((o) => o.id === category?.id);
  data.value[index] = category;
  updateCategory.value = undefined;
}

const onSearch = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchShops(
    {
      ...(pagination as PaginationProps),
      search: query.value,
    }

  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false

}

const columns: DataTableColumns<Shop> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: $i18n.t('name'),
    key: 'name',
  },
  {
    title: $i18n.t('address'),
    key: 'address',
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
                type: 'warning',
                onClick: () => {
                  updateCategory.value = row;
                },

              },
              { default: () => $i18n.t('edit'), }
            ),
            h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                type: row.paymentString ? 'success' : 'warning',
                onClick: () => setActiveShop(row),
              },
              { default: () => 'Set Primary', }
            ),
            h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                type: row.paymentString ? 'success' : 'warning',
                onClick: () => {
                  showQrScanner.value = row.id;
                },
              },
              { default: () => $i18n.t('KHQR'), }
            ),
            h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                type: 'error',
                onClick: () => deleteCategory(row),
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
const deleteCategory = (shop: Shop) => {
  const d = dialog.warning({
    title: 'Delete',
    content: `Do you want to remove shop name: ${shop.name} ?`,
    positiveText: 'Confirm',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await removeShop(shop.id!);
        data.value = data.value.filter((o) => o.id !== shop?.id);
        return;
      } catch (error) {
        notificationHttpError(error, notification);
      }
    }
  })
}

const setActiveShop = async (shop: Shop) => {

  isLoading.value = true

  await updateShop({
    ...shop,
    activeShop: true
  })

  isLoading.value = false
}

</script>
