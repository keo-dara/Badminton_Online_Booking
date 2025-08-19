<template>
  <n-card :title="false ? $t('editMember') : $t('addMember')" class="dark-mode-card">
    <n-form ref="formRef" :model="userCredentials" :rules="validationRules">
      <n-form-item path="userName" :label="$t('username')">
        <n-input v-model:value="userCredentials.userName" @keydown.enter.prevent :placeholder="$t('username')" />
      </n-form-item>
      <n-form-item path="password" :label="$t('password')">
        <n-input v-model:value="userCredentials.password" type="password" @keydown.enter.prevent
          :placeholder="$t('password')" />
      </n-form-item>

      <n-form-item path="role" :label="$t('role')">
        <n-select v-model:value="userCredentials.role" filterable :placeholder="$t('selectRole')" :options="options"
          class="pt-2" />
      </n-form-item>

      <n-form-item path="shopId" :label="$t('shop')">
        <n-select :loading="shopAsync.status.value !== 'success'" v-model:value="userCredentials.shopId" filterable
          :placeholder="$t('shop')" :options="shopAsync.data.value?.data.map((shop) => ({
            label: shop.name,
            value: shop.id
          }))" />
      </n-form-item>

      <n-button data-testid="submit-user-info"
        :disabled="userCredentials.role === null || userCredentials.password === null" round @click="addUserHandler"
        class="w-full">
        {{ $t('addMember') }}
      </n-button>
    </n-form>
  </n-card>
</template>
<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { RoleUser, type User } from "~/models";
import { NButton, NCard, NForm, NSelect, NFormItem, NInput, useNotification } from 'naive-ui';
import { addMember, fetchShops } from '~/api';

const shopAsync = await useAsyncData(
  'shop',
  () => fetchShops({ page: 1, pageSize: 10 })
)

const emiters = defineEmits(['added'])

const { $i18n } = useNuxtApp();


definePageMeta({
  layout: "default",
});


const options = [
  {
    label: 'Admin',
    value: RoleUser.Admin
  },
  {
    label: 'Sale',
    value: RoleUser.Sale
  },
]

const formRef = ref<FormInst | null>(null);
const userCredentials = ref<User>({ userName: "", password: "", role: RoleUser.Admin });

const validationRules: FormRules = {
  userName: [
    {
      required: true,
      message: $i18n.t("validation.is_required", {
        field: $i18n.t("username"),
      }),
    },
    {
      pattern: /^[a-z0-9]+$/,
      message: $i18n.t("validation.lowercase_only", {
        field: $i18n.t("username"),
      }),
    },
  ],
  password: [
    {
      required: true,
      message: $i18n.t("validation.is_required", {
        field: $i18n.t("password"),
      }),
    },
  ],
  role: [
    {
      required: true,
      message: $i18n.t("validation.is_required", {
        field: $i18n.t("role"),
      }),
    },
  ],
  shopId: [
    {
      required: true,
      message: $i18n.t("validation.is_required", {
        field: $i18n.t("shop"),
      }),
    },
  ],
};
const notification = useNotification();

const addUserHandler = async (e: MouseEvent) => {
  e.preventDefault();
  if (await formRef.value?.validate()) {
    try {

      await addMember(userCredentials.value);
      notification.info({
        content: $i18n.t("createSuccessful", {
          field: "User",
        }),
        duration: 1500
      })
      emiters('added')
      userCredentials.value.userName = "";
      userCredentials.value.password = "";
    } catch (error) {
      notificationHttpError(error, notification);
    }
  }
};
</script>
