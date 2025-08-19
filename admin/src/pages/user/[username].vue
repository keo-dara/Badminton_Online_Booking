<template>
    <div class="h-screen flex">
        <BackHeader :title="$i18n.t('resetPassword')">
            <n-form ref="formRef" :model="userCredentials" :rules="validationRules">
                <n-form-item path="password" label="Password">
                    <n-input v-model:value="userCredentials.password" @keydown.enter.prevent />
                </n-form-item>
                <n-form-item path="confirmPassword" label="Confirm Password">
                    <n-input v-model:value="userCredentials.confirmPassword" @keydown.enter.prevent />
                </n-form-item>
                <n-button :disabled="userCredentials.confirmPassword != userCredentials.password" round
                    @click="addUserHandler" class="w-full">
                    Reset User Password
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
} from "naive-ui";
import { resetPasswordMember } from "~/api";
import type { Credentials } from "~/models";


const { $i18n } = useNuxtApp();

definePageMeta({
    layout: "default",
});


const router = useRouter();
const route = useRoute();
const formRef = ref<FormInst | null>(null);
const userCredentials = ref<Credentials>({ password: "", confirmPassword: "" });


const validationRules: FormRules = {
    password: [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("password"),
            }),
        },
    ],
    confirm: [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("confirmPassword"),
            }),
        },
    ],
};

definePageMeta({
    middleware: 'auth'
})


const addUserHandler = async (e: MouseEvent) => {
    e.preventDefault();

    const username = route.params.username as string;
    if (await formRef.value?.validate()) {
        await resetPasswordMember(username, userCredentials.value.password);
        router.back();
    }

};

</script>

<style></style>