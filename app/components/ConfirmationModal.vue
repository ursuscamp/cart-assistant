<template>
  <Modal :show="show" :title="title" @close="handleClose">
    <p class="text-bark-300">{{ message }}</p>
    <template #footer>
      <button @click="handleClose" class="btn-secondary">Cancel</button>
      <button @click="handleConfirm" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors">
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/Modal.vue'

const props = withDefaults(defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
}>(), {
  confirmText: 'Delete'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

function handleClose() {
  emit('close')
}

function handleConfirm() {
  emit('confirm')
}
</script>
