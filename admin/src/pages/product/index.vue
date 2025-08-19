<template>
  <div class="mx-auto p-1 ">
    <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-8 ">
      <div class="col-span-8 mr-4">
        <grid class="grid grid-cols-3 mb-1 gap-1">
          <n-card class="dark-mode-card" :title="$i18n.t('search')">
            <div class="flex flex-row ">
              <n-input v-model:value="query" placeholder="Search shops" data-testid="search-input" class="mb-4"
                :clearable="true">
                <template #prefix>
                  <Icon name="ion:search-outline" />
                </template>
              </n-input>
              <n-button @click="onSearch" type="tertiary" data-testid="btn-search">
                {{ $t('search') }}
              </n-button>
            </div>
          </n-card>

          <n-card class="dark-mode-card" :title="$t('shop')">
            <n-infinite-scroll style="height: 100px" :distance="10">
              <div v-for="shop in shops" :key="shop.id" class="flex justify-between items-center p-2 border-gray-200">
                <p :class="{ 'text-blue-500': shop === activeShop, 'text-gray-700': shop !== activeShop }">
                  {{ shop.name }}
                </p>
                <button @click="setActiveShop(shop)" :disabled="shop === activeShop" :class="[
                  'px-3 py-1 rounded transition-colors duration-200',
                  shop === activeShop
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                ]">
                  {{ shop === activeShop ? $t('activated') : $t('activate') }}
                </button>
              </div>
            </n-infinite-scroll>
          </n-card>

          <n-card class="dark-mode-card" :title="$i18n.t('total') + ' ' + pagination.itemCount">
            <n-button data-testid="btn-product-add"  @click="() => showAddProduct = true" type="default">
              <Icon name="solar:add-circle-linear" />
            </n-button>
          </n-card>
        </grid>

        <n-card data-testid="table-product" :title="addingSpace($t('management'), $t('product'))" class="dark-mode-card">
          <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
            @update:page="handlePageChange" :loading="isLoading" />
        </n-card>
      </div>

    </div>

    <n-modal :mask-closable="true" :show="showAddProduct" style="width: 600px">
      <form-product :shop="activeShop" class="mb-4 mt-5 lg:mt-0 lg:col-span-3 col-span-8 grid grid-cols-1 gap-1"
        @product-added="onProductAdded" @close="() => showAddProduct = false"></form-product>
    </n-modal>


    <n-modal :show="!!updateProduct" style="width: 600px">
      <form-product @close="() => updateProduct = undefined" @product-updated="onProductUpdate"
        :product="updateProduct"></form-product>
    </n-modal>


  </div>
</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NSpace, NModal, NDataTable, NCard, NInfiniteScroll, NInput, useDialog, useNotification, NAvatar } from 'naive-ui'
import { fetchMeApi, fetchProducts, fetchShops, removeProduct, updateShop } from '~/api';
import type { Product, Shop } from '~/models';


const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Product>()


const showAddProduct = ref(false)
const shops = ref<Shop[]>([]);
const activeShop = ref<Shop>();
const query = ref<string>()
const updateProduct = ref<Shop>();


onMounted(async () => {
  initdata()
})

const setActiveShop = async (shop: Shop) => {
  activeShop.value = shop;

  isLoading.value = true

  pagination.page = 1;
  const { data: results, meta } = await fetchProducts(
    {
      ...(pagination as PaginationProps),
      shopId: activeShop.value?.id,
    }
  );

  await updateShop({
    ...shop,
    activeShop: true
  })

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const initdata = async () => {
  isLoading.value = true
  const me = await fetchMeApi();

  console.log(me);

  const shopsResult = await fetchShops(
    pagination as PaginationProps
  );

  shops.value = shopsResult.data;

  if (shops.value.length != 0) {
    const activeShop = shopsResult.data.filter((value) => value.id === me.shop?.id);
    setActiveShop(activeShop[0]);
  } else {
    notification.info({
      content: "Need to create shop"
    });
  }

  const { data: results, meta } = await fetchProducts(
    {
      ...(pagination as PaginationProps),
      shopId: activeShop.value?.id
    }
  );
  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

async function handlePageChange(currentPage: number) {
  isLoading.value = true
  pagination.page = currentPage;
  const { data: results, meta } = await fetchProducts(
    {
      ...(pagination as PaginationProps),
      shopId: activeShop.value?.id
    }
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}


const onProductAdded = (product: Product) => {
  data.value.push(product);
  showAddProduct.value = false;
}

const onProductUpdate = (product: Product) => {
  const index = data.value.findIndex((o) => o.id === product?.id);
  data.value[index] = product;
  updateProduct.value = undefined;
}

const onSearch = async () => {
  isLoading.value = true
  const { data: results, meta } = await fetchProducts(
    {
      ...(pagination as PaginationProps),
      search: query.value,
      shopId: activeShop.value?.id,
    }

  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false
}

const columns: DataTableColumns<Product> = [
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
          size: "large",
          src: `${row.img}`
        })
      ]
    }
  },
  {
    title: $i18n.t('name'),
    key: 'name',
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
                  updateProduct.value = row;
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
            h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                type: 'primary',
                onClick: () => {
                  router.push(`/product/${row.id}`)
                },
              },
              { default: () => $i18n.t('varient') }
            ),
          ],
        }
      )
    },
  },
]

const router = useRouter();
const dialog = useDialog();
const notification = useNotification();
const deleteCategory = (shop: Shop) => {
  const d = dialog.warning({
    title: 'Delete',
    content: `Do you want to remove product name: ${shop.name} ?`,
    positiveText: 'Confirm',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await removeProduct(shop.id!);
        data.value = data.value.filter((o) => o.id !== shop?.id);
        return;
      } catch (error) {
        notificationHttpError(error, notification);
      }
    }
  })
}

</script>
