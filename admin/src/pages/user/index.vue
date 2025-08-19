<template>
  <div class="h-screen flex">
    <n-card :title="$i18n.t('user')">
      <n-button data-testid="add-user-button" class="mb-4">
        <NuxtLink to="user/add" class="p-1">ADD USER</NuxtLink>
      </n-button>
      <n-data-table remote :columns="columns" :data="users" :pagination="pagination" class="pr-4"
        @update:page="handlePageChange" :loading="loadingRef" @update:sorter="handleSorterChange" />
    </n-card>

    <dialog-update-bakong-dialog :user="selectedRow!" :show-modal="selectedRowType === UpdateType.Bakong"
      @update:show-modal="onCloseModal"></dialog-update-bakong-dialog>
  </div>
</template>

<script lang="ts" setup>
import { NDataTable, NButton, NCard, type DataTableColumns, NModal, NAvatar, type PaginationProps, useNotification } from "naive-ui";
import { fetchUsersSystem } from "~/api";
import { ApiOrder, type User } from "~/models";

enum UpdateType {
  Balance,
  Bakong,
}

const { $i18n } = useNuxtApp();

const loadingRef = ref(false);

const router = useRouter();
const users = ref<User[]>([]);
const selectedRow = ref<User>()
const selectedRowType = ref<UpdateType>()


const pagination = reactive<Partial<PaginationProps>>({
  pageSize: 9,
  page: 1,
  pageCount: 10,
  prefix({ itemCount }) {
    return `Total is ${itemCount}.`
  }
})

async function handleSorterChange(newSorter: { order: string }) {

  loadingRef.value = true
  const result = await fetchUsersSystem({
    page: pagination!.page!,
    pageSize: pagination!.pageSize!,
    order: newSorter.order !== "descend" ? ApiOrder.DESC : ApiOrder.ASC,
  });
  users.value = result.data;
  pagination.pageCount = result.meta!.pageCount;
  pagination.itemCount = result.meta!.itemCount;
  loadingRef.value = false
}


onMounted(() => {
  getUsers();
});


// get user for table
const getUsers = async () => {

  loadingRef.value = true
  const result = await fetchUsersSystem({
    page: pagination!.page!,
    pageSize: pagination!.pageSize!,

  });
  users.value = result.data;
  pagination.pageCount = result.meta!.pageCount;
  pagination.itemCount = result.meta!.itemCount;
  loadingRef.value = false
}

const columns: DataTableColumns = [
  {
    title: "ID",
    key: "id",
    sorter: 'default'
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
          onClick: () => {
            router.push("user/" + row.userName)
          },
          type: "warning"
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
];


async function handlePageChange(currentPage: number) {
  loadingRef.value = true
  const result = await fetchUsersSystem({
    page: pagination!.page!,
    pageSize: pagination!.pageSize!,

  });
  users.value = result.data;
  pagination.page = currentPage;
  pagination.pageCount = result.meta!.pageCount;
  pagination.itemCount = result.meta!.itemCount;
  loadingRef.value = false
}

const onCloseModal = () => {
  selectedRowType.value = undefined;
  selectedRow.value = undefined;
}

</script>