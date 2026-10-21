<script setup lang="ts">
import { computed, ref } from 'vue';

const connectionRequestsSent = ref(10); // temp value
const acceptedRequests = ref(10); // temp value

const activeTab = ref('connection_requests');
const tabs = computed(() => [
  { value: 'connection_requests', title: `Connection requests (${ connectionRequestsSent.value })` },
  { value: 'acceptance', title: `Accepted (${ acceptedRequests.value })`, disabled: true },
]);
</script>

<template>
  <div>
    <v-btn-toggle
      v-model="activeTab"
      mandatory
      divided
      color="#0073b1"
      class="mb-4 d-flex"
    >
      <v-btn
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :variant="$vuetify.theme.current.dark ? undefined : 'outlined'"
        :disabled="tab.disabled"
        style="width: calc(100% / 2)"
      >
        {{ tab.title }}
      </v-btn>
    </v-btn-toggle>

    <v-card width="100%" height="300"></v-card>
  </div>
</template>
