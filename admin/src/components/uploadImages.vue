<template>
  <n-upload :default-file-list="previewFileList" class="mb-4" :custom-request="customRequest" accept="image/*"
    @finish="handleUploadFinish" list-type="image-card" @preview="handlePreview" :max="1" />
  <n-modal v-model:show="showModal" preset="card" style="width: 600px" title="A Cool Picture">
    <img :src="previewImageUrl" style="width: 100%">
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui'
import { NUpload, NModal, useNotification } from 'naive-ui'
import { uploadImage } from '~/api'

const props = defineProps<{
  imgUrl?: string
}>()

const showModal = ref(false)
const previewImageUrl = ref('')

function handlePreview(file: UploadFileInfo) {
  const { url } = file
  previewImageUrl.value = url as string
  showModal.value = true
}

const previewFileList = ref<UploadFileInfo[]>(
  props.imgUrl
    ? [{
      id: 'preview',
      name: 'preview-image.png',
      status: 'finished',
      url: props.imgUrl
    }]
    : []
)

const emit = defineEmits(['upload-success'])
const notification = useNotification()

const customRequest = ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  const formData = new FormData()
  formData.append('file', file.file!)

  notification.info({
    content: "Uploading Image...",
    duration: 0,
    closable: false
  })

  updatePreviewFileList(URL.createObjectURL(file.file!), 'uploading')

  uploadImage(formData)
    .then(data => {
      onFinish()
      console.log('Upload successful:', data)
      updatePreviewFileList(data, 'finished')
      emit('upload-success', data)
      notification.destroyAll()
      notificationSuccess()
    })
    .catch(error => {
      onError()
      console.error('Upload error:', error)
      updatePreviewFileList('', 'error')
      notificationError(error)
    })
}

const handleUploadFinish = (options: any) => {
  console.log('Upload finished', options)
}

const updatePreviewFileList = (url: string, status: 'pending' | 'uploading' | 'finished' | 'removed' | 'error') => {
  previewFileList.value = [{
    id: 'preview',
    name: 'preview-image.png',
    status: status,
    url: url
  }]
}

const notificationSuccess = () => {
  notification.success({
    content: "Image uploaded successfully!",
    duration: 3000
  })
}

const notificationError = (error: any) => {
  notification.error({
    content: `Upload failed: ${error.message || 'Unknown error'}`,
    duration: 5000
  })
}
</script>