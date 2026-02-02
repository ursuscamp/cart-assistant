<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div :class="['modal-container', size]" @click.stop>
        <div v-if="title" class="modal-header flex-shrink-0">
          <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
          <button v-if="showClose" @click="$emit('close')" class="p-1 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body flex-1 overflow-y-auto scrollbar-thin">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer flex-shrink-0">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
}>(), {
  size: 'md',
  showClose: true
})

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.modal-container {
  @apply bg-bark-900 border border-bark-700 rounded-xl w-full flex flex-col max-h-[90vh];
}

.modal-container.sm {
  @apply max-w-sm;
}

.modal-container.md {
  @apply max-w-lg;
}

.modal-container.lg {
  @apply max-w-2xl;
}

.modal-container.xl {
  @apply max-w-4xl;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-bark-800;
}

.modal-body {
  @apply p-4;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-4 border-t border-bark-800;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
