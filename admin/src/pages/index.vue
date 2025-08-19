<template>
  <div class="mx-auto p-1">
    <div class="flex flex-row gap-1">
      <n-card class="mb-1 dark-mode-card" :title="$t('search')">
        <div class="flex flex-col sm:flex-row gap-1">
          <n-date-picker v-model:value="startDate" type="date" :placeholder="$t('startDate')" />
          <n-date-picker v-model:value="endDate" type="date" :placeholder="$t('endDate')" />
          <n-button @click="() => applyDateRange()">
            <Icon name="ion:search-outline" />
          </n-button>
          <n-button type="error" :disabled="!startDate && !endDate" @click="() => applyDateRange(true)">
            <Icon name="solar:trash-bin-2-line-duotone" />
          </n-button>
        </div>
      </n-card>
      <n-card class="mb-1 dark-mode-card w-1/3">
        <div class="flex flex-col gap-2">
          <n-button @click="() => (isCreateBooking = true)" type="primary">
            CREATE BOOKING
          </n-button>
          <n-button @click="applyDate" type="info">
            {{ isFilterToday ? 'CLEAR FILTER' : 'TODAY' }} - {{ dashboardAsync.data.value?.todayBooking }}
          </n-button>
        </div>
      </n-card>
    </div>

    <div>
      <n-card :title="addingSpace($t('management'), $t('transaction'))" class="dark-mode-card">
        <n-data-table :remote="true" :columns="columns" :data="data" :pagination="pagination"
          @update:page="handlePageChange" :loading="isLoading" />
      </n-card>
    </div>

    <dialog-booking-payment v-if="!!qrWithSaleInfo" @confirmed="confirmPayment" :show="!!qrWithSaleInfo"
      :payment="qrWithSaleInfo" @close="hideDialog" @success="updatePayQr"></dialog-booking-payment>
    <dialog-booking-payment2 v-if="!!qrWithSaleInfo2" @confirmed="confirmPayment2" :show="!!qrWithSaleInfo2"
      :payment="qrWithSaleInfo2" @close="hideDialog" @success="updatePayQr2"></dialog-booking-payment2>
    <n-modal :show="isCreateBooking" style="width: 550px" preset="dialog" @close="() => (isCreateBooking = false)">
      <form-booking @added="onCreated" />
    </n-modal>
    <n-modal :show="isreBooking" style="width: 550px" preset="dialog" @close="() => (isreBooking = false)">
      <form-rebooking @added="onCreated" @updated="onUpdated" :booking="reBooking" />
    </n-modal>
    <n-modal :show="!!editBooking" style="width: 550px" preset="dialog" @close="() => (editBooking = undefined)">
      <form-booking @updated="onUpdated" :booking="editBooking" />
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import {
  NButton,
  NDatePicker,
  NSpace,
  NModal,
  NCard,
  NDataTable,
  useNotification,
  NText,
  NTag,
  NDropdown,
  useDialog
} from 'naive-ui';
import {
  fetchBookings,
  fetchDashboard,
  getImageQrBooking,
  removeBooking,
  updateBooking
} from '~/api';
import {
  SalePayment,
  SaleStatus,
  type Booking,
  type QrWithSale
} from '~/models';

const { $i18n } = useNuxtApp();
const { data, pagination, isLoading } = usePagination<Booking>();
const startDate = ref();
const endDate = ref();
const notification = useNotification();
const isCreateBooking = ref(false);
const isFilterToday = ref(false);
const isreBooking = ref(false);
const reBooking = ref<Booking>();
const qrWithSaleInfo = ref<QrWithSale>();
const qrWithSaleInfo2 = ref<QrWithSale>();
const editBooking = ref<Booking>();

import { NuxtTime } from '#components';

const applyDateRange = async (clear?: boolean) => {
  try {
    if (startDate.value && endDate.value) {
      isLoading.value = true;
      const { data: results, meta } = await fetchBookings({
        ...(pagination as PaginationProps),
        startDate: clear ? undefined : startDate.value,
        endDate: clear ? undefined : endDate.value
      });

      if (clear) {
        startDate.value = null;
        endDate.value = null;
      }

      data.value = results;
      pagination.pageCount = meta!.pageCount;
      pagination.itemCount = meta!.itemCount;
      isLoading.value = false;

      if (!clear) {
        notification.success({
          title: 'Date Range Applied',
          content: `From ${formatDateNotime(
            startDate.value
          )} to ${formatDateNotime(endDate.value)}`,
          duration: 1000
        });
      }
    } else {
      notification.warning({
        title: 'Invalid Date Range',
        content: 'Please select both start and end dates',
        duration: 3000
      });
    }
  } catch (error) {
    notificationHttpError(error, notification);
  } finally {
    isLoading.value = false;
  }
};
const applyDate = async () => {

  if (isFilterToday.value) {

    await initdata()
    isFilterToday.value = false;
    return;
  }

  try {
    const today = new Date();
    const formate_date = today.toISOString().split('T')[0];
    isLoading.value = true;
    const { data: results, meta } = await fetchBookings({
      ...(pagination as PaginationProps),
      date: formate_date
    });

    data.value = results;
    pagination.pageCount = meta!.pageCount;
    pagination.itemCount = meta!.itemCount;
    isLoading.value = false;
    notification.success({
      title: 'Date Applied',
      content: `Date ${formate_date}`,
      duration: 1000
    });

    isFilterToday.value = true;
  } catch (error) {
    notificationHttpError(error, notification);
  } finally {
    isLoading.value = false;
  }
};

definePageMeta({
  middleware: 'auth'
});

onMounted(async () => {
  initdata();
});

const dashboardAsync = await useAsyncData(
  'dashboard',
  () => fetchDashboard()
)

const initdata = async () => {
  isLoading.value = true;
  const { data: results, meta } = await fetchBookings(
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
  const { data: results, meta } = await fetchBookings(
    pagination as PaginationProps
  );

  data.value = results;
  pagination.pageCount = meta!.pageCount;
  pagination.itemCount = meta!.itemCount;
  isLoading.value = false;
}

const onCreated = (booking: Booking) => {
  data.value.splice(0, 0, booking);
  isCreateBooking.value = false;
  isreBooking.value = false;
};

const onUpdated = (booking: Booking) => {
  const index = data.value.findIndex(o => o.id === booking?.id);
  const oldbooking = data.value[index];
  oldbooking.customer = booking.customer;
  oldbooking.phone = booking.phone;
  data.value[index] = oldbooking;
  editBooking.value = undefined;
};

const columns: DataTableColumns<Booking> = [
  {
    title: 'No',
    key: 'no'
  },
  {
    title: $i18n.t('customer'),
    key: 'customer'
  },
  {
    title: $i18n.t('court'),
    key: 'court.name'
  },
  {
    title: $i18n.t('phone'),
    key: 'phone'
  },
  {
    title: '% Booking',
    key: 'bookPercent',
    render(row) {
      return h(NText, `${row.bookPercent!}%`);
    }
  },
  {
    title: '% Discount',
    key: 'discount',
    render(row) {
      return h(NText, `${row.discount!}%`);
    }
  },
  {
    title: $i18n.t('total'),
    key: 'total',
    render(row) {
      return h(NText, `\$${row.total!}`);
    }
  },
  {
    title: $i18n.t('time'),
    key: 'times',
    render(row) {
      return row.times!.map(time =>
        h(
          NTag,
          time.displayTime
        )
      );
    }
  },
  {
    title: $i18n.t('bookingDate'),
    key: 'createdAt',
    render(row) {
      return h(NText, formatDate(row.bookingDate!).split(' ')[0]);
    }
  },
  {
    title: $i18n.t('created'),
    key: 'createdAt',
    render(row) {
      const createdAtTimestamp = Date.parse(row.createdAt!);
      return h(NuxtTime, {
        datetime: createdAtTimestamp,
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
              NDropdown,
              {
                trigger: 'click',
                onSelect: (s, i) => handleSelect(s, row),
                options: [
                  {
                    label: $i18n.t('PAY'),
                    key: 'pay',
                    disabled: row.status !== SaleStatus.Pending
                  },
                  {
                    label: 'Completed Payment',
                    key: 'pay2',
                    disabled: row.status !== SaleStatus.PaidSome
                  },
                  {
                    label: $i18n.t('delete'),
                    disabled: row.status !== SaleStatus.Expired,
                    key: 'delete'
                  },
                  {
                    label: 'Edit User Info',
                    disabled: row.status !== SaleStatus.Pending,
                    key: 'edit'
                  },
                  {
                    label: 'Update Booking',
                    disabled: row.status !== SaleStatus.PaidSome,
                    key: 'rebooking'
                  },
                  {
                    label: 'Cancelled Booking',
                    disabled: row.status === SaleStatus.Expired,
                    key: 'cancelled'
                  },
                  {
                    label: 'Invoice',
                    key: 'invoice'
                  }
                ]
              },
              createButton({
                icon: 'ic:baseline-more-vert',
                onClick: () => { }
              })
            )
          ]
        }
      );
    }
  },

  {
    title: $i18n.t('status'),
    key: 'status',
    render(rowData) {
      return h(
        NTag,
        { bordered: false, type: typeColor(rowData.status!) },
        rowData.status?.toLocaleUpperCase()
      );
    }
  },
  {
    title: $i18n.t('amount'),
    key: 'amount',
    render(rowData) {
      return h(
        NTag,
        { bordered: false, type: typeColor(rowData.status!) },
        `\$${rowData.price}`,
      );
    }
  }
];

const dialog = useDialog();
const handleSelect = (
  key: 'pay' | 'pdf' | 'delete' | 'edit' | 'pay2' | 'rebooking' | 'cancelled' | 'invoice',
  booking: Booking
) => {
  if (key === 'pay') {
    getQrPayment(booking.id!);
  } else if (key === 'pay2') {
    getQrPayment2(booking.id!);
  } else if (key === 'rebooking') {
    isreBooking.value = true;
    reBooking.value = booking;
  } else if (key === 'edit') {
    editBooking.value = booking;
  } else if (key === 'cancelled') {
    const d = dialog.warning({
      title: 'Cancelled Booking',
      content: `Do you want to cancel no: ${booking.no} ?`,
      positiveText: 'Confirm',
      onPositiveClick: async () => {
        d.loading = true;
        try {
          updateBooking({
            id: booking.id!,
            status: SaleStatus.Cancelled
          });
          data.value = data.value.filter(o => o.id !== booking?.id);
          d.loading = false;
        } catch (error) {
          notificationHttpError(error, notification);
        }
      }
    });
  }
  else if (key === 'delete') {
    const d = dialog.warning({
      title: 'Delete',
      content: `Do you want to cancel no: ${booking.no} ?`,
      positiveText: 'Confirm',
      onPositiveClick: async () => {
        d.loading = true;
        try {
          removeBooking(booking.id!);
          data.value = data.value.filter(o => o.id !== booking?.id);
          d.loading = false;
        } catch (error) {
          notificationHttpError(error, notification);
        }
      }
    });
  } else if (key === 'invoice') {
    window.open(`https://www.vsmashbadminton.online/booking-detail/${booking.id}`, '_blank');
  }

};

const getQrPayment = async (id: number) => {
  try {
    qrWithSaleInfo.value = await getImageQrBooking(id);
  } catch (error) {
    notificationHttpError(error, notification);
  }
};
const getQrPayment2 = async (id: number) => {
  try {
    qrWithSaleInfo2.value = await getImageQrBooking(id);
  } catch (error) {
    notificationHttpError(error, notification);
  }
};

const confirmPayment = async (type?: SalePayment, notify?: boolean ) => {
  try {
    const result = await updateBooking({
      id: qrWithSaleInfo.value!.booking!.id,
      paymentType: type,
      status: SaleStatus.Paid,     
    }, notify);
    const index = data.value.findIndex(
      o => o.id === qrWithSaleInfo.value!.booking!.id
    );
    const newValue = data.value[index];
    newValue.status = result.status;
    data.value[index] = newValue;
    notificationSuccess(notification);
    hideDialog();
  } catch (error) {
    console.log(error);

    notificationHttpError(error, notification);
  }
};
const confirmPayment2 = async (type?: SalePayment, notify?: boolean) => {
  try {
    const result = await updateBooking({
      id: qrWithSaleInfo2.value!.booking!.id,
      paymentType: type,
      status: SaleStatus.Paid
    }, notify);
    const index = data.value.findIndex(
      o => o.id === qrWithSaleInfo2.value!.booking!.id
    );
    const newValue = data.value[index];
    newValue.status = result.status;
    data.value[index] = newValue;
    notificationSuccess(notification);
    hideDialog();
  } catch (error) {
    console.log(error);
    notificationHttpError(error, notification);
  }
};

const updatePayQr = (status: SaleStatus) => {
  const index = data.value.findIndex(
    o => o.id === qrWithSaleInfo.value!.sale!.id
  );
  const newValue = data.value[index];
  newValue.status = SaleStatus.PaidSome;
  data.value[index] = newValue;
};
const updatePayQr2 = (status: SaleStatus) => {
  const index = data.value.findIndex(
    o => o.id === qrWithSaleInfo2.value!.sale!.id
  );
  const newValue = data.value[index];
  newValue.status = SaleStatus.Paid;
  data.value[index] = newValue;
};

const hideDialog = () => {
  qrWithSaleInfo.value = undefined;
  qrWithSaleInfo2.value = undefined;
};
</script>
