<template>
  <n-form ref="formRef" :model="userCredentials" :rules="validationRules">
    <n-form-item path="password" :label="$t('password')">
      <n-input v-model:value="userCredentials.password" />
    </n-form-item>
    <n-form-item path="confirmPassword" :label="$t('confirmPassword')">
      <n-input v-model:value="userCredentials.confirmPassword" />
    </n-form-item>
    <n-button :disabled="userCredentials.confirmPassword != userCredentials.password" round @click="addUserHandler"
      class="w-full">
      {{ $t('resetPassword') }}
    </n-button>
  </n-form>
</template>

<script lang="ts" setup>
import {
  NInput,
  NButton,
  NForm,
  NFormItem,
  type FormRules,
  type FormInst,
  useNotification,
} from "naive-ui";
import { resetPasswordMember } from "~/api";
import type { Credentials } from "~/models";

const { $i18n } = useNuxtApp();

const props = defineProps<{
  username: string
}>()

const emiter = defineEmits(['update'])

const formRef = ref<FormInst | null>(null);
const notification = useNotification();
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

const addUserHandler = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      await resetPasswordMember(props.username, userCredentials.value.password);
      emiter('update')
      notificationSuccess(notification);
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
};

</script>

<style></style>