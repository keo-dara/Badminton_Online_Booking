<template>
  <div class="mx-auto p-1">
    <n-card class="mb-1 dark-mode-card" :title="$t('search')">
      <div class="flex flex-row gap-1">
        <n-input v-model:value="query" :placeholder="mergeString($t('search'), $t('category'))" class="mb-4"
          :clearable="true">
          <template #prefix>
            <Icon name="ion:search-outline" />
          </template>
        </n-input>
        <n-button @click="onSearch" type="tertiary">
          {{ $t('search') }}
        </n-button>
      </div>
    </n-card>
    <div class="lg:flex lg:space-x-1">
      <!-- Category Table -->
      <div class="lg:w-2/3 mb-1 lg:mb-0">
        <n-card :title="addingSpace($t('management'), $t('customer'))" class="dark-mode-card">
          <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
            @update:page="handlePageChange" :loading="isLoading" />
        </n-card>
      </div>

      <!-- Add/Edit Category Form -->
      <div class="lg:w-1/3">
        <form-customer @added="onCategoryAdded"></form-customer>
      </div>
    </div>

    <n-modal :show="!!updateCategory">
      <div class="w-1/3 h-1/3">
        <form-customer @updated="onCategoryUpdate" :category="updateCategory"></form-customer>
      </div>
    </n-modal>

  </div>
</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NSpace, NModal, NCard, NDataTable, NInput, useDialog, useNotification } from 'naive-ui'
import { fetchCustomer, removeCustomer } from '~/api';
import type { Category, Customer } from '~/models';

const { $i18n } = useNuxtApp()
const { data, pagination, isLoading } = usePagination<Customer>()
const query = ref<string>()
const updateCategory = ref<Category>();

onMounted(async () => {
  initdata()
})

const initdata = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchCustomer(
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
  const { data: results, meta } = await fetchCustomer(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const onCategoryAdded = (category: Category) => {
  data.value.push(category)
}

const onCategoryUpdate = (category: Category) => {
  const index = data.value.findIndex((o) => o.id === category?.id);
  data.value[index] = category;
  updateCategory.value = undefined;
}

const onSearch = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchCustomer(
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

const columns: DataTableColumns<Category> = [
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
                type: 'warning',
                onClick: () => {
                  updateCategory.value = row;
                },
              },
              { default: () => $i18n.t('edit') }
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
              { default: () => $i18n.t('delete') }
            ),
          ],
        }
      )
    },
  },
]

const dialog = useDialog();
const notification = useNotification();
const deleteCategory = (category: Category) => {
  const d = dialog.warning({
    title: $i18n.t('warning'),
    content: `Do you want to remove customer name: ${category.name} ?`,
    positiveText: 'Confirm',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await removeCustomer(category.id!);
        data.value = data.value.filter((o) => o.id !== category?.id);
        return;
      } catch (error) {
        notificationHttpError(error, notification);
      }
    }
  })
}

</script>
