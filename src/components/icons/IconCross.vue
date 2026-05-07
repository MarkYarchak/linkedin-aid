<script lang="ts" setup>
interface Props {
  size?: string | number;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  size: 16,
  color: 'currentColor',
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon-cross"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</template>

<style scoped>
.icon-cross {
  display: inline-block;
  vertical-align: middle;
}
</style>
