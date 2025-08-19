<template>
  <n-modal :show="showModal" preset="dialog" title="Edit User Guide" class=" rounded-md" :style="{
    width: '800px',
    height: '600px'
  }"  @close="closeModal" >
     <template #header>
       <div>Edit User Guides</div>
     </template>
     <div class="py-4  flex flex-col " >
      <ClientOnly fallback-tag="div" fallback="Loading editor..." >
        <QuillEditor @update:content="onEditorContent" content-type="html"  :content="contents"/>
      </ClientOnly>
       <n-text v-if="contentError" type="error">{{ contentError }}</n-text>
     </div>
     <template #action>
      <n-button @click="closeModal">Cancel</n-button>
      <n-button type="primary" @click="handleConfirm">Confirm</n-button>
     </template>
  </n-modal>
 </template>
 
 <script setup lang="ts">
 import { ref } from 'vue'
 import { NModal, NButton, NSpace, NText } from 'naive-ui'
 import '@vueup/vue-quill/dist/vue-quill.snow.css'
 import { QuillEditor } from '@vueup/vue-quill'
 
const props =  defineProps({
   showModal: Boolean,
   contents: String,

 })
 
 const content = ref(props.contents)
 const emit = defineEmits(['update:showModal', 'submit'])
 
 const contentError = ref<string>('')
 
 const closeModal = () => {
   emit('update:showModal', false)
   resetForm()
 }
 
 const validateContent = () => {
   if (!content.value) {
     contentError.value = 'Content cannot be empty'
     return false
   }
   contentError.value = ''
   return true
 }
 
 const handleConfirm = () => {
   if (validateContent()) {
    
     emit('submit', content.value)
     closeModal()
   }
 }
 
 const resetForm = () => {
   content.value = ''
   contentError.value = ''
 }

 const onEditorContent = (value: string) => {
    content.value = value;
 }
 </script>