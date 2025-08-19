<template>
  <div class="w-screen h-screen flex bg-slate-500">
    <div class="bg-slate-800 m-auto px-5 py-10 rounded-md">
      <n-form ref="formRef" :rules="validationRules" :model="loginCredentials" @keydown.enter.prevent="loginHandler">
        <div class="w-72 mb-5">
          <n-form-item path="username" :show-label="false">
            <n-input data-testid="username" v-model:value="loginCredentials.username" type="text"
              :placeholder="$i18n.t('username')" />
          </n-form-item>
          <n-form-item path="password" :show-label="false">
            <n-input data-testid="password" show-password-on="click" v-model:value="loginCredentials.password"
              type="password" :placeholder="$i18n.t('password')">
              <template #password-visible-icon>
                <Icon name="jam:eye-close-f" size="16"></Icon>
              </template>
              <template #password-invisible-icon>
                <Icon name="jam:eye-f"></Icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="otp" :show-label="false">
            <n-input v-model:value="loginCredentials.authCode" type="text"
              :placeholder="$i18n.t('authenticator')"></n-input>
          </n-form-item>
        </div>
        <n-button data-testid="loginbutton" type="primary" class="w-72" @click="loginHandler">{{
          $t("login")
          }}</n-button>
      </n-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "#components";
import {
  NInput,
  NButton,
  NForm,
  NFormItem,
  type FormRules,
  type FormInst,
  useNotification,
} from "naive-ui";

const { $i18n } = useNuxtApp();
import { useAuthStore } from "~/stores";
const store = useAuthStore()


type Credentials = {
  username: string;
  password: string;
  authCode?: string;
};

definePageMeta({
  layout: "guest",
});

const formRef = ref<FormInst | null>(null);
const loginCredentials = ref<Credentials>({
  username: "", password: "",

});

const validationRules: FormRules = {
  username: [
    {
      required: true,
      message: $i18n.t("validation.is_required", {
        field: $i18n.t("username"),
      }),
    },
  ],
  authCode: [],
  password: [
    {
      required: true,
      message: $i18n.t("validation.is_required", {
        field: $i18n.t("password"),
      }),
    },
  ],
};

const notification = useNotification();
const loginHandler = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {
      await store.login(loginCredentials.value.username, loginCredentials.value.password, loginCredentials.value.authCode)
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }

};
</script>

<style></style>