<template>
  <div class="flex flex-col h-full">
    <AppBar />

    <!-- Courts -->
    <div v-if="status === 'pending'" class="grow w-full flex justify-center items-center">
      <VanLoading />
    </div>
    <div v-if="status == 'error'" class="grow w-full flex justify-center items-center">
      <IconRefrigerator :size="60" />
      <div>Error</div>
    </div>
    <div v-else-if="!data?.data.length" class="grow w-full flex flex-col justify-center items-center">
      <IconMonitorX :size="60" />
      <div>No Court Available</div>
    </div>

    <div v-else class="grow overflow-scroll">
      <div class="py-4 px-4">
        <div class="flex justify-between items-center">
          <p class="text-xl font-bold">Available Courts</p>
        </div>
      </div>
      <CourtCard v-for="court in data.data" :court="court" />
    </div>
  </div>
  

  <VanCalendar v-model:show="showCalendar" class="!max-w-[480px] !left-auto" :show-confirm="false" :min-date="minDate"
    @confirm="confirmDate" />
</template>

<script setup lang="ts">
import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';
import { getCourts } from '~/api/court';
import PayWayCheckout from '~/components/PayWayCheckout.vue';
import type { PaginationOption } from '~/interfaces/pagination.interface';

Locale.use('en-US', enUS);

const showCalendar = ref(false);
const minDate = new Date();
let selectedDate = ref<Date>(new Date());

const { data, status } = await useAsyncData('courts', () =>
  getCourts({
    page: 1,
    take: 10
  } as PaginationOption)
);


function confirmDate(val: any) {
  showCalendar.value = false;
  selectedDate.value = val;
}
</script>
