<template>
  <div class="flex flex-col h-dvh bg-white relative  bg-gradient-to-br from-orange-100 to-orange-200">
    <booking-confirmation v-if="qrPayment" :payment="qrPayment!" id="ticket" />
    <div class="grow"></div>
    <div v-if="showButtons" class="sticky bottom-0 bg-white flex items-center px-4 pt-4 pb-6 gap-3">
      <div
        class="w-full flex justify-center items-center rounded-lg line-clamp-1 p-3 text-center font-bold text-md border border-orange-500 text-orange-500"
        @click="() => {
          router.push('/');
        }
          ">
        <div>Home</div>
      </div>
      <div
        class="w-full flex justify-center items-center rounded-lg line-clamp-1 p-3 text-center font-bold text-md bg-orange-500 text-white"
        @click="() => download()">
        <div>Download</div>
      </div>
    </div>
    <VanPopup v-model:show="showDownload" round :closeable="true" :close-on-click-overlay="false"
      class="!w-[80vw] !max-w-[400px]">
      <div class="p-4">
        <img :src="imageUrl" alt="" />
        <div
          class="w-full flex justify-center items-center rounded-lg line-clamp-1 p-3 text-center font-bold text-md bg-orange-500 text-white"
          @click="() => { }">
          <div>Download</div>
        </div>
      </div>
    </VanPopup>

  </div>


</template>

<script setup lang="ts">

import { getQR } from '~/api/booking';
import type { QRPayment } from '~/models/payment';
import * as htmlToImage from 'html-to-image';

const route = useRoute();
const router = useRouter();
const qrPayment = ref<QRPayment>();
const showDownload = ref(false);
const showButtons = ref(false);
const imageUrl = ref('');

function download() {
  var node = document.getElementById('ticket');

  if (node) {
    htmlToImage
      .toPng(node)
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `ticket-${route.params.id}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }
}

async function getImageUrl() {
  var node = document.getElementById('ticket');

  if (node) {
    await htmlToImage
      .toPng(node)
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `ticket-${route.params.id}.png`;
        link.href = dataUrl;
        imageUrl.value = dataUrl;
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }
}



function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

onMounted(async () => {
  qrPayment.value = await getQR(route.params.id as string);
  await delay(2000);
  await getImageUrl();
  await getImageUrl();
  await getImageUrl();
  showButtons.value = true;
});
</script>

<style scoped></style>
