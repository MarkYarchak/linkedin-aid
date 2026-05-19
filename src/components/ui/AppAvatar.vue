<script lang="ts" setup>
import { ref, computed } from 'vue';
import PersonIcon from '@/components/icons/PersonIcon.vue';

interface Props {
  src?: string | null;
  alt?: string;
  shape?: 'circle' | 'square';
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: '',
  shape: 'circle',
  size: 'md',
});

const hasError = ref(false);

const src = computed(() => {
  if (hasError.value) return null;
  return props.src;
});

const sizeClass = computed(() => `size-${props.size}`);

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm': return 16;
    case 'lg': return 48;
    default: return 24;
  }
});

function handleError() {
  hasError.value = true;
}
</script>

<template>
  <div class="app-avatar" :class="[shape, sizeClass]">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      @error="handleError"
    />
    <div v-else class="placeholder">
      <slot name="placeholder">
        <PersonIcon :size="iconSize" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.app-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f3f3f3;
  color: #999;
  flex-shrink: 0;
  border: 1px solid #eee;
}

.app-avatar.circle {
  border-radius: 50%;
}

.app-avatar.square {
  border-radius: 4px;
}

.app-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.size-sm {
  width: 32px;
  height: 32px;
}

.size-md {
  width: 48px;
  height: 48px;
}

.size-lg {
  width: 64px;
  height: 64px;
}
</style>
