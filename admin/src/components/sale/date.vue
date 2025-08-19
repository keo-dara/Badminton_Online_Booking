<template>
  <n-card :title="$t('date')" class="dark-mode-card col-span-1">
    {{ $dayjs(Date.now()).utc().format('MMMM D, YYYY') }}
  </n-card>
</template>

<script lang="ts" setup>
import { NCard } from "naive-ui";
</script>