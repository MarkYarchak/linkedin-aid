<script lang="ts" setup>
interface Props {
  title?: string;
  variant?: 'outlined' | 'shadow';
}

withDefaults(defineProps<Props>(), {
  variant: 'outlined',
});
</script>

<template>
  <div class="app-card" :class="[`is-${variant}`]">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.app-card {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-card.is-outlined {
  border: 1px solid #e2e8f0;
}

.app-card.is-shadow {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fcfcfd;
}

.card-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.card-body {
  padding: 16px;
}
</style>
