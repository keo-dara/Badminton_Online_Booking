<template>
  <div class="mx-auto p-1">

    <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
      <n-card :title="$t('profile') + ' ' + profileValue.userName" class="dark-mode-card col-span-1">
        <div class="flex flex-col justify-center items-center">
          <n-avatar round :size="96" :src="profileValue.profilePicture" />
          <n-button data-testid="logoutbutton" strong secondary type="error" :on-click="authStore.logout" class="mt-4">
            {{ $t('logout') }}
          </n-button>
        </div>
      </n-card>
      <n-card :title="$t('shop')" class="dark-mode-card col-span-1" v-if="profileStore.profile.role !== RoleUser.Root">
        {{ profileValue.shop?.name }}
      </n-card>
      <n-card title="Two Factor Authentication" class="dark-mode-card">
        <div class="flex flex-col justify-center items-start">
          <n-switch v-model:value="twoFactorEnabled" class="mt-4" @update:value="toggleTwoFactor">
            {{ $t('enableTwoFactor') }}
          </n-switch>
          <n-image v-if="twoFactorQRCode" :src="twoFactorQRCode" :width="200" :height="200" class="mt-4"
            :alt="$t('twoFactorQRCode')" />
        </div>
      </n-card>
      <n-card :title="$t('languages')" class="dark-mode-card">
        <div class="flex flex-row gap-1 justify-center items-start">
          <img :class="[
            'rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110',
            { 'border-blue-500': selectedLanguage === lang.value, 'border-transparent': selectedLanguage !== lang.value }
          ]" v-for="lang in languageOptions" :src="lang.img" @click="() => changeLang(lang.value)" />
        </div>
      </n-card>

      <n-card title="DEV TOOL" class="dark-mode-card col-span-1">
        <n-button type="primary" @click="copySecret">
          COPY DEV TOKEN
        </n-button>
      </n-card>
      <n-card :title="$t('theme')" class="dark-mode-card col-span-1">
        <div class="flex justify-center items-center">
          <n-switch v-model:value="profileStore.themeDark" @update:value="toggleTheme">
            <template #checked>🌑</template>
            <template #unchecked>☀️</template>
          </n-switch>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">

import {
  NButton,
  NAvatar,
  NSwitch,
  NImage,
  NCard,
  useNotification,
} from "naive-ui";
import { generateTokenApi, twoFactorSystem } from "~/api";
import { useProfileStore } from "~/stores";
import englishLogo from "~/assets/images/english.jpg";
import khmerLogo from "~/assets/images/khmer.jpg";
import { RoleUser } from "~/models";

const profileStore = useProfileStore();

const toggleTheme = (value: boolean) => {
  profileStore.themeDark = value
  profileStore.saveTheme();
}

const authStore = useAuthStore();
const { locale, setLocale } = useI18n();
const profileValue = computed(() => profileStore.profile)

const twoFactorEnabled = ref(false);
const twoFactorQRCode = ref('');
const notification = useNotification();

const changeLang = (lang: string) => {
  setLocale(lang);
  profileStore.setLang(lang);
}

onMounted(async () => {
  await profileStore.fetchMe();
  twoFactorEnabled.value = !!profileValue.value.twoFactorAuthenticationSecret;
});


const copySecret = async () => {
  try {
    const token = await generateTokenApi(profileStore.profile!.id!)
  
    await navigator.clipboard.writeText(token);
    notification.success({
      content: 'Secret copied to clipboard!',
      duration: 2000,
    });
  } catch (error) {
    notification.error({
      content: 'Failed to copy secret.',
      duration: 2000,
    });
  }
}

async function toggleTwoFactor(value: boolean) {
  try {

    const response = await twoFactorSystem(value);
    if (value) {
      twoFactorQRCode.value = response;
    } else {
      twoFactorQRCode.value = '';
    }
    twoFactorEnabled.value = value;

    
  } catch (error) {
    notificationHttpError(error, notification);
  }
}

const selectedLanguage = ref(locale);
const languageOptions = [
  { label: 'English', value: 'en', img: englishLogo },
  { label: 'ខ្មែរ', value: 'km', img: khmerLogo },
];

onMounted(async () => {
  await profileStore.fetchMe();
  twoFactorEnabled.value = !!profileValue.value.twoFactorAuthenticationSecret;
});

</script>
