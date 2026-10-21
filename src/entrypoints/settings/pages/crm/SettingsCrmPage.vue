<script lang="ts" setup>
const subTabs = [
  { label: 'Home', value: 'home', route: '/crm' },
  { label: 'Entities', value: 'entities', route: '/crm/entities' },
  { label: 'AI', value: 'ai', route: '/crm/ai' },
  { label: 'Signals', value: 'signals', route: '/crm/signals' },
  { label: 'Interactions', value: 'interactions', route: '/crm/interactions' },
];
</script>

<template>
  <div>
    <v-btn-toggle
      mandatory
      divided
      color="#0073b1"
      class="mb-4 d-flex"
    >
      <v-btn
        v-for="tab in subTabs"
        :key="tab.value"
        :to="tab.route"
        exact
        :variant="$vuetify.theme.current.dark ? undefined : 'outlined'"
        class="flex-grow-1"
      >
        {{ tab.label }}
      </v-btn>
    </v-btn-toggle>

    <router-view></router-view>
  </div>
</template>
