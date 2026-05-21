<script lang="ts" setup>
interface Props {
  size?: string | number;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  size: 14,
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
    class="icon-industry"
  >
    <rect x="2" y="10" width="20" height="12" rx="2" />
    <path d="M7 10V4h10v6" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
</template>

<style scoped>
.icon-industry {
  display: inline-block;
  vertical-align: middle;
}
</style>
