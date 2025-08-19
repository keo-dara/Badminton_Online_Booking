<template>
  <div class="mx-auto p-4">
    <div class="lg:flex lg:space-x-4">
      <!-- Table -->
      <div class="lg:w-2/3 mb-4 lg:mb-0">
        <n-card
          :title="addingSpace($t('management'), $t('time'))"
          class="dark-mode-card"
        >
          <n-data-table
            :remote="true"
            :columns="columns"
            :data="data"
            :pagination="pagination"
            @update:page="handlePageChange"
            :loading="isLoading"
            @sorter-change="handleSorterChange"
          />
        </n-card>
      </div>

      <!-- Add/Edit Form -->
      <div class="lg:w-1/3">
        <n-card :title="$t('time')" class="dark-mode-card">
          <form-time @added="onCategoryAdded" />
        </n-card>
      </div>
    </div>

    <n-modal
      @close="() => (updateValue = undefined)"
      :show="!!updateValue"
      style="width: 500px"
      preset="dialog"
    >
      <form-time @updated="onCategoryUpdate" :time="updateValue" />
    </n-modal>
  </div>
</template>
<script setup lang="ts">
  import type {
    DataTableColumns,
    PaginationProps,
    DataTableSortState
  } from 'naive-ui';
  import {
    NButton,
    NSpace,
    NModal,
    NCard,
    NDataTable,
    useDialog,
    useNotification,
    NText
  } from 'naive-ui';
  import { fetchTimes, removeTime } from '~/api';
  import type { Time } from '~/models';

  import { Icon, NuxtTime } from '#components';

  const { $i18n } = useNuxtApp();
  const { data, pagination, isLoading } = usePagination<Time>();
  const updateValue = ref<Time>();

  onMounted(async () => {
    initdata();
  });

  const initdata = async (order?: 'ASC' | 'DESC') => {
    isLoading.value = true;
    const { data: results, meta } = await fetchTimes({
      ...(pagination as PaginationProps),
      order
    });

    data.value = results;
    pagination.page = 1;
    pagination.pageCount = meta!.pageCount;
    pagination.itemCount = meta!.itemCount;
    isLoading.value = false;
  };

  async function handleSorterChange(sorter: DataTableSortState) {
    if (sorter.order === 'ascend') {
      initdata('ASC');
    } else {
      initdata('DESC');
    }
  }

  async function handlePageChange(currentPage: number) {
    isLoading.value = true;
    pagination.page = currentPage;
    const { data: results, meta } = await fetchTimes(
      pagination as PaginationProps
    );

    data.value = results;
    pagination.pageCount = meta!.pageCount;
    pagination.itemCount = meta!.itemCount;
    isLoading.value = false;
  }

  const onCategoryAdded = (time: Time) => {
    data.value.push(time);
  };
  const onCategoryUpdate = (time: Time) => {
    const index = data.value.findIndex(o => o.id === time?.id);
    data.value[index] = time;
    updateValue.value = undefined;
  };

  const columns: DataTableColumns<Time> = [
    {
      title: 'ID',
      key: 'id',
      sorter: (row1, row2) => row1.price! - row2.price!
    },
    {
      title: $i18n.t('from'),
      key: 'from'
    },
    {
      title: $i18n.t('to'),
      key: 'to'
    },
    {
      title: $i18n.t('price'),
      key: 'price'
    },
    {
      title: $i18n.t('shift'),
      key: 'shift'
    },
    {
      title: 'VIP',
      key: 'isVip',
      render(row) {
        return h('div', { class: 'flex items-center' }, [
          h(Icon, {
            name: row.isVip
              ? 'material-symbols:circle'
              : 'material-symbols:circle',
            color: row.isVip ? 'gold' : 'gray',
            size: '24'
          })
        ]);
      }
    },
    {
      title: $i18n.t('display'),
      key: 'displayTime'
    },
    {
      title: $i18n.t('created'),
      key: 'createdAt',
      render(row) {
        return h(NuxtTime, {
          datetime: Date.parse(row.createdAt!),
          relative: true
        });
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
                    updateValue.value = row;
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
  const deleteCategory = (time: Time) => {
    const d = dialog.warning({
      title: 'Delete',
      content: `Do you want to remove : ${time.from} - ${time.to} ?`,
      positiveText: 'Confirm',
      onPositiveClick: async () => {
        d.loading = true;
        try {
          await removeTime(time.id!);
          data.value = data.value.filter(o => o.id !== time?.id);
          return;
        } catch (error) {
          notificationHttpError(error, notification);
        }
      }
    });
  };
</script>
