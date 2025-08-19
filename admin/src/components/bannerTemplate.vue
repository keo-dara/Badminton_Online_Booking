<template>
    <div class="h-screen flex">
        <BackHeader title="Banner" class="m-4">
            <n-form ref="formRef" :model="formDataApp" :rules="validationRules">


                <n-upload :headers="{
                    'Authorization': 'Bearer ' + authStore.token,
                }" :action="baseApiUrl + '/api/upload'" :data="{ 'name': 'file' }" @finish="handleFinish"
                    list-type="image-card" class="p-4" :multiple="false" :max="1" :default-file-list="previewFileList">
                    {{ $i18n.t('upload') }}
                </n-upload>

                <n-form-item path="title" label="Title">
                    <n-input v-model:value="formDataApp!.title" @keydown.enter.prevent />
                </n-form-item>
                <n-form-item path="subtitle" label="SubTitle">
                    <n-input v-model:value="formDataApp!.subtitle" @keydown.enter.prevent />
                </n-form-item>

                <div class="pb-4 flex flex-row">
                    <span class="pr-4">Published</span>
                    <n-switch v-model:value="formDataApp.isPublished" />
                </div>


                <n-button round @click="handleSubmit" class="w-full" :disabled="!formDataApp.image">
                    {{ !props.banner ? 'New' : 'Change' }}
                </n-button>
            </n-form>
        </BackHeader>

    </div>
</template>

<script lang="ts" setup>
import {
    NInput,
    NButton,
    NForm,
    NFormItem,
    type FormRules,
    type FormInst,
    NSwitch,
    useNotification,
    type UploadFileInfo,
    NUpload
} from "naive-ui";
import { baseApiUrl, createBanner, updateBanner } from "~/api";

const authStore = useAuthStore();
import type { Banner } from "~/models";
const { $i18n } = useNuxtApp();
const router = useRouter()

definePageMeta({
    layout: "default",
});

const props = defineProps<{
    banner?: Banner,
    previewFileList?: UploadFileInfo[]
}>()



onMounted(() => {
    if (props.banner) {
        formDataApp.value = props.banner;
    }
})


const handleFinish = ({
    file,
    event
}: {
    file: UploadFileInfo
    event?: ProgressEvent
}) => {

    formDataApp.value.image = `${baseApiUrl}/uploads/${file.name}`;

}

const notification = useNotification();
const formRef = ref<FormInst | null>(null);
const formDataApp = ref<Banner>({
    isPublished: false
});


const validationRules: FormRules = {
    title: [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("title"),
            }),
        },
    ],
    subtitle: [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("subtitle"),
            }),
        },
    ],

};

definePageMeta({
    middleware: 'auth'
})



const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    if (await formRef.value?.validate()) {
        try {

            if (!props.banner) {

                await createBanner(formDataApp.value);
                notification.info({
                    title: $i18n.t("createSuccessful"),
                })
            } else {
                await updateBanner(formDataApp.value)
                notification.info({
                    title: $i18n.t("updateSuccessful"),
                })
            }


            router.back()
        } catch (error) {
            const content = `${$i18n.t("networkErr")} [${error}]`
            notification.error({
                content
            })
        }
    }

};

</script>

<style></style>