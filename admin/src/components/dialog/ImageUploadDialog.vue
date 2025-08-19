<template>
    <n-modal :show="props.show">
        <n-card style="width: 600px" title="Upload Image" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-upload :custom-request="customRequest" :max="1" accept="image/*" @finish="handleUploadFinish">
                <n-upload-dragger>
                    <div style="margin-bottom: 12px">
                        <n-icon size="48" :depth="3">
                            <archive-icon />
                        </n-icon>
                    </div>
                    <n-text style="font-size: 16px">
                        Click or drag a file to this area to upload
                    </n-text>
                </n-upload-dragger>
            </n-upload>
            <template #footer>
                <n-space justify="end">
                    <n-button @click="onCancel!">Cancel</n-button>
                    <n-button :disabled="imgUrl == null" type="primary" @click="confirmUpload">Confirm</n-button>
                </n-space>
            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { NButton, NModal, NCard, NUpload, NUploadDragger, NIcon, NText, NP, NSpace, type UploadCustomRequestOptions } from 'naive-ui'
import { uploadImage } from '~/api';


const imgUrl = ref<string>()
const props = defineProps({
    show: {
        type: Boolean
    },
    onCancel: Function,
})

const emit = defineEmits(['upload-success'])

const customRequest = ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
    const formData = new FormData()
    formData.append('file', file.file!)

    uploadImage(formData)
        .then(data => {
            onFinish()
            console.log('Upload successful:', data)
            imgUrl.value = data;
        })
        .catch(error => {
            onError()
            console.error('Upload error:', error)
        })
}

const handleUploadFinish = (options: any) => {
    console.log('Upload finished', options)
}

const confirmUpload = () => {

    emit('upload-success', imgUrl.value)
}
</script>