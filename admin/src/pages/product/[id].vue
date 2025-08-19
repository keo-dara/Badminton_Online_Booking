<template>
  <div class=" h-screen p-1">
    <BackHeader :title="$t('varient')">
      <div class="lg:flex lg:space-x-4">
        <div class="lg:w-2/3 mb-4 lg:mb-0">
          <n-card :title="$t('management') + $t('varient')" class="dark-mode-card">
            <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
              @update:page="handlePageChange" :loading="isLoading" />
          </n-card>
        </div>
        <div class="lg:w-1/3">
          <form-varient @added="onAdded" :product-id="productId" />
        </div>
      </div>

      <n-modal :show="!!updateVarient">
        <div class="w-1/3 h-1/3">
          <form-varient @added="onAdded" :product-id="productId" :varient="updateVarient" @updated="onUpdate"
            @close="() => updateVarient = undefined" />
        </div>
      </n-modal>
    </BackHeader>
  </div>

</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NCard, NDataTable, NSpace, useNotification, NModal } from 'naive-ui'
import { fetchVarients } from '~/api';
import { Stocktype, type Varient } from '~/models';

let productId = ref(0);
const route = useRoute()
const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Varient>()
const updateVarient = ref()

onMounted(async () => {
  productId.value = Number(route.params.id);
  initdata()
})

const initdata = async () => {

  isLoading.value = true
  const { data: results, meta } = await fetchVarients(
    { ...pagination as PaginationProps, productId: productId.value, },
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

async function handlePageChange(currentPage: number) {
  isLoading.value = true
  pagination.page = currentPage;
  const { data: results, meta } = await fetchVarients(
    { ...pagination as PaginationProps, productId: productId.value, },
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const onAdded = (varient: Varient) => {
  data.value.push(varient)
}


const onUpdate = (varient: Varient) => {
  const index = data.value.findIndex((o) => o.id === varient?.id);
  data.value[index] = varient;
  updateVarient.value = undefined;
}


const columns: DataTableColumns<Varient> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: $i18n.t('name'),
    key: 'name',
  },
  {
    title: $i18n.t('code'),
    key: 'code',
  },
  {
    title: $i18n.t('price'),
    key: 'price',
    render(row) {
      return [
        h("p", `$${row.price?.toFixed(2)}`)
      ]
    }
  },
  {
    title: $i18n.t('quantity'),
    key: 'quantity',
    render(row) {
      const count = row.stocks!.reduce((p, c) => {
        return p + (c.type! === Stocktype.In ? c.quantity! : -c.quantity!);
      }, 0);

      return [
        h("p", `${count}`)
      ]
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
            createButton({
              tooltip: $i18n.t("edit"),
              icon: 'solar:pen-2-bold-duotone',
              onClick: () => {
                updateVarient.value = row;
              },
              type: "info"
            }),
            createButton({
              tooltip: $i18n.t("stock"),
              icon: 'solar:box-bold',
              onClick: () => {
                router.push(`/stock/${row.id}`)
              },
              type: "warning"
            }),

          ],
        }
      )
    },
  }
  // {
  //   title: $i18n.t('date'),
  //   key: 'createdAt',
  //   render(row) {
  //     return h(NText, formatDate(row.createdAt!))
  //   }
  // },
]
const router = useRouter();
const notification = useNotification();

</script>
