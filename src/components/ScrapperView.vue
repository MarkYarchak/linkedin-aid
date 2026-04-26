<script lang="ts" setup>
import ScrapeActions from '@/components/ScrapeActions.vue';

interface Props {
  tabUrl: string;
}
defineProps<Props>();
</script>

<template>
  <div>
    <ScrapeActions :tab-url="tabUrl" />
  </div>
</template>
