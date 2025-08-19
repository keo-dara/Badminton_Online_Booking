<template>
    <div>
        <n-form ref="formRef" :model="formData" :rules="rules">
            <n-select v-model:value="formData.shift" filterable placeholder="Shift" :options="options" class="pb-6 9" />
            <n-form-item path="from" :label="$t('from')">
                <n-input-number v-model:value="formData.from" @keydown.enter.prevent :placeholder="$t('from')" />
            </n-form-item>
            <n-form-item path="to" :label="$t('to')">
                <n-input-number v-model:value="formData.to" @keydown.enter.prevent :placeholder="$t('to')" />
            </n-form-item>
            <n-form-item path="price" :label="$t('price')">
                <n-input-number v-model:value="formData.price" @keydown.enter.prevent :placeholder="$t('price')" />
            </n-form-item>

            <div class="flex flex-row pb-4">
                <p class="pr-4">VIP: </p>
                <n-switch v-model:value="formData.isVip!" />
            </div>

            <n-button data-testid="submit-user-info" round @click="submitForm" type="success">
                {{ $t('create') }}
            </n-button>
        </n-form>
    </div>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { NButton, NSelect, NForm, NFormItem, NInputNumber, useNotification, NSwitch } from 'naive-ui';
import { createTime, updateTime } from '~/api';
import { Shift, type Time } from '~/models';

const formRef = ref<FormInst | null>(null);

const props = defineProps<{
    time?: Time
}>()


const options = [
    {
        label: 'Morning',
        value: Shift.Morning
    },
    {
        label: 'Afternoon',
        value: Shift.Afternoon
    },
]

const emit = defineEmits(['added', 'updated'])

const rules = {
    from: {
        required: true,
    },
    to: {
        required: true,
    },
    price: {
        required: true,
    },
}

const formData = ref<Time>({
    id: props.time?.id,
    from: props.time?.from ?? null,
    to: props.time?.to ?? null,
    isVip: props.time?.isVip ?? null,
    shift: props.time?.shift ?? Shift.Morning,
    price: !Number(props.time?.price)   ? 0 : Number(props.time?.price),
})

const isEditing = ref(!!props.time)
const notification = useNotification();


const submitForm = async (e: MouseEvent) => {
    e.preventDefault();
    if (await formRef.value?.validate()) {
        try {

            if (!props.time) {
                const result = await createTime(formData.value);
                emit('added', result);
                notification.success({
                    content: 'Time created successfully',
                    title: "Message",
                    duration: 1000
                })
            } else {
                const result = await updateTime(formData.value);
                emit('updated', result);
            }
            resetForm();
        } catch (error) {
            notificationHttpError(error, notification);
        }
    }

}

const resetForm = () => {
    formData.value.id = undefined
    formData.value.from = null;
    formData.value.to = null;
    formData.value.price = null;
    isEditing.value = false
}
</script>