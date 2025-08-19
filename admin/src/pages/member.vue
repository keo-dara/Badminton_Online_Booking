<template>
  <div class="mx-auto p-1">
    <div class="flex flex-row gap-1">
      <n-card class="mb-1 dark-mode-card" :title="$t('search')">
        <div class="flex flex-row gap-1 ">
          <n-input v-model:value="query" :placeholder="$t('search') + $t('member')" class="mb-4" :clearable="true">
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
        <n-card :title="addingSpace($t('management'), $t('member'))" class="dark-mode-card">
          <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
            @update:page="handlePageChange" :loading="isLoading" />
        </n-card>
      </div>

      <!-- Add/Edit Category Form -->
      <div class="lg:w-1/3">
        <form-member @added="onAddedMember"></form-member>
      </div>

    </div>

    <n-modal :show="!!updateUser">
      <form-member @shop-updated="onUpdateMember" :shop="updateUser"></form-member>
    </n-modal>
    <n-modal :show="!!updatePassword" preset="dialog" @close="() => updatePassword = undefined">
      <form-password :username="updatePassword?.userName!" @update="() => updatePassword = undefined" </form-password>
    </n-modal>

  </div>
</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NStatistic, NModal, NCard, NDataTable, NInput, useDialog, useNotification, NAvatar } from 'naive-ui'
import { blockUser, fetchUsers } from '~/api';
import { RoleUser, type Shop, type User } from '~/models';


const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<User>()
const query = ref<string>()
const updateUser = ref<User>();
const updatePassword = ref<User>();

onMounted(async () => {
  initdata()
})

const initdata = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchUsers(
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
  const { data: results, meta } = await fetchUsers(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const onAddedMember = (shop: Shop) => {
  // data.value.push(shop)
  onSearch()
}

const onUpdateMember = (category: Shop) => {
  const index = data.value.findIndex((o) => o.id === category?.id);
  data.value[index] = category;
  updateUser.value = undefined;
}

const onSearch = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchUsers(
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

const columns: DataTableColumns<User> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: $i18n.t("picture"),
    key: "profilePicture",
    render(row) {
      return [
        h(NAvatar, {
          round: true,
          size: "large",
          src: `${row.profilePicture}`
        })
      ]
    }
  },
  {
    title: $i18n.t("username"),
    key: "userName",
  },
  {
    title: $i18n.t("shop"),
    key: "shop.name",
  },
  {
    title: $i18n.t("role"),
    key: "role",
  },
  {
    title: $i18n.t("action"),
    key: 'action',
    render(row) {
      return [
        createButton({
          tooltip: $i18n.t("resetPassword"),
          icon: 'jam:padlock-open',
          disabled: !!row.blockedAt,
          onClick: () => {
            updatePassword.value = row;
          },
          type: "warning"
        }),
        createButton({
          tooltip: $i18n.t("block"),
          icon: 'solar:user-block-outline',
          disabled: row.role === RoleUser.Admin || !!row.blockedAt,
          onClick: () => {
            confirmBlockUser(row);
          },
          type: "error"
        }),
      ]
    }
  },
  {
    title: $i18n.t("createdBy"),
    key: "createdBy",
    render(row: any) {
      return [
        h("p", `${row?.createdBy?.userName ?? "N/A"}`)
      ]
    }
  },
]


const dialog = useDialog();
const notification = useNotification();

const confirmBlockUser = (user: User) => {
  const d = dialog.warning({
    title: 'Delete',
    content: `Do you want to block: ${user.userName} ?`,
    positiveText: 'Confirm',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await blockUser(user.id!)
      } catch (error) {
        notificationHttpError(error, notification);
      }
    }
  })
}


</script>
