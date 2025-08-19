<template>
  <VitePwaManifest />
  <n-notification-provider>
    <nuxt-page />
  </n-notification-provider>
</template>

<script setup lang="ts">


import { NNotificationProvider } from "naive-ui";


const store = useAuthStore()
const profileStore = useProfileStore();


onMounted(async () => {
  try {
    await store.initToken();
    await profileStore.fetchMe();
    await navigateTo("/");
  } catch (error) {
    store.logout();
  }
})

</script>