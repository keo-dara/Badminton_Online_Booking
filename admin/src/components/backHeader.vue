<template>
  <n-card>
    <n-page-header :title="title" @back="$router.back()">
      <slot></slot>
    </n-page-header>
  </n-card>
</template>

<script lang="ts" setup>
import { NPageHeader, NCard } from 'naive-ui'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})
const { $i18n } = useNuxtApp();

</script>