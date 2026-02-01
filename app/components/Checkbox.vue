<template>
  <label :class="[
    'flex items-center gap-3 cursor-pointer group',
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  ]">
    <div class="relative">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        class="peer sr-only"
      />
      <div :class="[
        'w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
        modelValue
          ? 'bg-forest-500 border-forest-500'
          : 'border-bark-600 bg-bark-800 group-hover:border-bark-500',
        disabled ? 'opacity-50' : ''
      ]">
        <svg v-if="modelValue" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span v-if="$slots.default" :class="[
      'text-sm transition-colors',
      modelValue ? 'text-bark-400 line-through' : 'text-bark-200 group-hover:text-white'
    ]">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
