<template>
  <div>
    <n-modal v-model:show="props.show">
      <n-card style="width: 600px" title="Confirm Payment" :bordered="false" size="huge" role="dialog"
        aria-modal="true">
        <template #header-extra>
          <n-button text @click="closeDialog">
            X
          </n-button>
        </template>

        <n-space vertical>
          <n-text>Are you sure you want to proceed with the payment?</n-text>
          <n-text strong>Amount: ${{ props.amount }}</n-text>
        </n-space>

        <template #footer>
          <n-space justify="end">
            <n-button @click="closeDialog">Cancel</n-button>
            <n-button type="primary" @click="confirmPayment">Confirm</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>

  </div>
</template>

<script lang="ts" setup>

import { NButton, NModal, NCard, NSpace, NText } from 'naive-ui'


const props = defineProps({
  show: {
    type: Boolean
  },
  amount: {
    type: Number
  },
  onConfirmPayment: Function,
  onCancel: Function,
})

const dialogVisible = ref(props.show)


const closeDialog = () => {
  dialogVisible.value = false
  props.onCancel!();
}

const confirmPayment = () => {
  console.log('Payment confirmed')
  props.onConfirmPayment!();
}

</script>
