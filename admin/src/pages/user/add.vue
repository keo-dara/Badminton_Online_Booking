<template>
    <div class="h-screen flex">
        <BackHeader :title="$i18n.t('addMember')">
            <n-form ref="formRef" :model="userCredentials" :rules="validationRules">
                <n-form-item path="userName" label="Username">
                    <n-input v-model:value="userCredentials.userName" @keydown.enter.prevent placeholder="Username" />
                </n-form-item>
                <n-form-item path="systemName" label="Company Name">
                    <n-input v-model:value="userCredentials.systemName" @keydown.enter.prevent
                        placeholder="System name" />
                </n-form-item>
                <n-form-item path="shop.name" label="Shop Name">
                    <n-input v-model:value="userCredentials.shop!.name" placeholder="Shop name" />
                </n-form-item>
                <n-form-item path="shop.address" label="Shop Address">
                    <n-input v-model:value="userCredentials.shop!.address" @keydown.enter.prevent
                        placeholder="Shop Address" />
                </n-form-item>
                <n-form-item path="shop.phone" label="Shop Phone">
                    <n-input v-model:value="userCredentials.shop!.phone" @keydown.enter.prevent
                        placeholder="Shop Phone" />
                </n-form-item>
                <n-form-item path="password" label="Password">
                    <n-input v-model:value="userCredentials.password" type="password" @keydown.enter.prevent
                        placeholder="Password" />
                </n-form-item>

                <n-text style="font-size: 16px">
                    Role
                </n-text>
                <!-- select role -->
                <n-select v-model:value="userCredentials.role" filterable placeholder="Please select a role for user"
                    :options="options" class="pb-6 pt-2" />

                <n-button data-testid="submit-user-info"
                    :disabled="userCredentials.role === null || userCredentials.password === null" round
                    @click="addUserHandler" class="w-full">
                    Create User
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
    NSelect,
    NText,
    type FormRules,
    type FormInst,
    useNotification,
} from "naive-ui";
import { addSystemMember } from "~/api";
import { RoleUser, type User } from "~/models";


const { $i18n } = useNuxtApp();
const options = [
    {
        label: 'Admin',
        value: RoleUser.Admin
    },
]

const router = useRouter();
const formRef = ref<FormInst | null>(null);
const userCredentials = ref<User>({
    role: RoleUser.Admin,
    shop: {
        name: '',
        address: '',
        phone: ''
    }
});

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
    systemName: [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("systemName"),
            }),
        },
    ],
    'shop.name': [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("shopName"),
            }),
        },
    ],
    'shop.address': [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("shopAddress"),
            }),
        },
    ],
    'shop.phone': [
        {
            required: true,
            message: $i18n.t("validation.is_required", {
                field: $i18n.t("shopPhone"),
            }),
        },
    ],
};

const notification = useNotification();

const addUserHandler = async (e: MouseEvent) => {
    e.preventDefault();
    if (await formRef.value?.validate()) {
        try {
            await addSystemMember(userCredentials.value);
            notification.info({
                content: $i18n.t("createSuccessful", {
                    field: $i18n.t('user'),
                }),
                duration: 1000
            })
            router.back();
        } catch (error) {
            notificationHttpError(error, notification);
        }
    }
};
</script>