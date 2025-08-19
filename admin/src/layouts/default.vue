<template>
  <VitePwaManifest />
  <client-only>
    <n-loading-bar-provider>
      <n-config-provider
        :theme="profileStore.themeDark ? darkTheme : lightTheme"
      >
        <n-dialog-provider>
          <n-notification-provider>
            <n-layout>
              <app-header></app-header>
              <n-layout :has-sider="true" v-if="user">
                <side-menu :user="user"></side-menu>
                <n-layout>
                  <div class="h-screen">
                    <nuxt-page />
                  </div>
                </n-layout>
              </n-layout>
            </n-layout>
          </n-notification-provider>
        </n-dialog-provider>
      </n-config-provider>
    </n-loading-bar-provider>
  </client-only>
</template>

<script setup lang="ts">
  import {
    NLayout,
    NConfigProvider,
    darkTheme,
    NNotificationProvider,
    NDialogProvider,
    NLoadingBarProvider,
    useLoadingBar,
    lightTheme
  } from 'naive-ui';
  import type { HttpResponseError, User } from '~/models';

  const store = useAuthStore();
  const profileStore = useProfileStore();
  const user = ref<User>();
  const { locale, setLocale } = useI18n();

  onMounted(async () => {
    await profileStore.loadTheme();
    const lang = await profileStore.loadLang();

    if (lang.value) {
      setLocale(lang.value);
    }

    try {
      await store.initToken();
      user.value = await profileStore.fetchMe();
    } catch (error: any) {
      const body = error.response._data;
      const err = body as HttpResponseError;
      if (err.statusCode === 401) {
        store.logout();
      }
    }
  });
</script>
