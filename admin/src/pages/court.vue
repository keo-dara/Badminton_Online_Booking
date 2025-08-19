<template>
  <div class="mx-auto p-1">
    <n-card class="mb-1 dark-mode-card" :title="$t('search')">
      <div class="flex flex-row gap-1">
        <n-input v-model:value="query" :placeholder="mergeString($t('search'), $t('court'))" class="mb-4"
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
      <div class="lg:w-2/3 mb-4 lg:mb-0">
        <n-card :title="addingSpace($t('management'), $t('court'))" class="dark-mode-card">
          <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
            @update:page="handlePageChange" :loading="isLoading" />
        </n-card>
      </div>

      <!-- Add/Edit Category Form -->
      <div class="lg:w-1/3">
        <n-card :title="$t('edit')" class="dark-mode-card">
          <form-court @added="onCategoryAdded" />
        </n-card>
      </div>
    </div>

    <n-modal :show="!!updateCategory" preset="dialog" @close="() => (updateCategory = undefined)">
      <form-court @updated="onCategoryUpdate" :category="updateCategory" />
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import {
  NButton,
  NSpace,
  NModal,
  NCard,
  NDataTable,
  NInput,
  useDialog,
  useNotification,
  NTag
} from 'naive-ui';
import { fetchCourts, removeCourt } from '~/api';
import type { Court } from '~/models';
import { Icon } from '#components';

const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Court>();
const query = ref<string>();
const updateCategory = ref<Court>();

onMounted(async () => {
  initdata();
});

const initdata = async () => {
  isLoading.value = true;
  const { data: results, meta } = await fetchCourts(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false;
};

async function handlePageChange(currentPage: number) {
  isLoading.value = true;
  pagination.page = currentPage;
  const { data: results, meta } = await fetchCourts(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false;
}

const onCategoryAdded = (category: Court) => {
  data.value.push(category);
};

const onCategoryUpdate = (category: Court) => {
  const index = data.value.findIndex(o => o.id === category?.id);
  data.value[index] = category;
  updateCategory.value = undefined;
};

const onSearch = async () => {
  isLoading.value = true;
  const { data: results, meta } = await fetchCourts({
    ...(pagination as PaginationProps),
    search: query.value
  });

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false;
};

const columns: DataTableColumns<Court> = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: $i18n.t('name'),
    key: 'name'
  },
  {
    title: $i18n.t('discount'),
    key: 'discount'
  },
  {
    title: $i18n.t('active'),
    key: 'enable',
    render(row) {
      return h('div', { class: 'flex items-center' }, [
        h(Icon, {
          name: row.enable
            ? 'material-symbols:circle'
            : 'material-symbols:circle',
          color: row.enable ? 'green' : 'red',
          size: '24'
        })
      ]);
    }
  },
  {
    title: $i18n.t('time'),
    key: 'times',
    render(row) {
      return row.times!.map(time =>
        h(NTag, {
          type: time.isVip ? 'warning' : 'success',  // Or use custom colors:
          style: time.isVip ? { color: '#f59e0b' } : { color: '#22c55e' },
        }, displayBookingTime(time.from!, time.to!, time.shift!))
      );
    }
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
                }
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
                onClick: () => deleteCategory(row)
              },
              { default: () => $i18n.t('delete') }
            )
          ]
        }
      );
    }
  }
];

const dialog = useDialog();
const notification = useNotification();
const deleteCategory = (category: Court) => {
  const d = dialog.warning({
    title: $i18n.t('warning'),
    content: `Do you want to remove court name: ${category.name} ?`,
    positiveText: 'Confirm',
    onPositiveClick: async () => {
      d.loading = true;
      try {
        await removeCourt(category.id!);
        data.value = data.value.filter(o => o.id !== category?.id);
        return;
      } catch (error) {
        notificationHttpError(error, notification);
      }
    }
  });
};
</script>
