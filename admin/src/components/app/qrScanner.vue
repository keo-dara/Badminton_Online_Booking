<!-- ImageUploadAndQRScanner.vue -->
<template>
  <div class="container mx-auto p-4">

    <!-- Image Upload -->
    <div class="mb-4">
      <input type="file" @change="onFileSelected" accept="image/*" class="mb-2" />
    </div>

    <div class="flex flex-col md:flex-row gap-4">
      <!-- Display uploaded image -->
      <div v-if="imageUrl" class="mb-4">
        <img :src="imageUrl" alt="Uploaded Image" class="max-w-[200px] max-h-[200px] object-contain border" />
      </div>

      <!-- QR Code Result -->
      <div v-if="qrResult" class="mb-4">
        <h3 class="text-xl font-semibold mb-2">QR Code Result:</h3>
        <p class="bg-slate-700-100 p-2 rounded">{{ qrResult }}</p>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isScanning" class="mt-4">
      <p class="text-gray-600">Scanning image for QR code...</p>
    </div>

    <n-button @click="onUploadKhqrString" style="width: 100%;" type="primary" :disabled="qrResult === ''">{{
      $t('upload') }}</n-button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import jsQR from 'jsqr'
import { NButton, useNotification } from 'naive-ui';
import { updateShop } from '~/api';

const imageUrl = ref('')
const selectedFile = ref(null)
const qrResult = ref('')
const isScanning = ref(false)

const onFileSelected = (event) => {
  selectedFile.value = event.target.files[0]
  imageUrl.value = URL.createObjectURL(selectedFile.value)
  qrResult.value = ''
  scanQRCode()
}
const emiter = defineEmits(['update'])
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
}
);

const notification = useNotification()

const onUploadKhqrString = async () => {
  try {

    const result = await updateShop({
      paymentString: qrResult.value,
      id: props.id,
    });
    notificationSuccess(notification)
    emiter('update', result);
  } catch (error) {
    notificationHttpError(error, notification);
  }
}

const scanQRCode = () => {
  if (!imageUrl.value) return

  isScanning.value = true
  qrResult.value = ''

  const img = new Image()
  img.src = imageUrl.value
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    context.drawImage(img, 0, 0, img.width, img.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code) {
      qrResult.value = code.data
    } else {
      qrResult.value = 'No QR code found in the image'
    }
    isScanning.value = false
  }

  img.onerror = () => {
    qrResult.value = 'Error loading image'
    isScanning.value = false
  }
}

// Automatically scan when imageUrl changes
watch(imageUrl, () => {
  if (imageUrl.value) {
    scanQRCode()
  }
})

</script>