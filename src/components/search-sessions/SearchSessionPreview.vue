<script lang="ts" setup>
import { computed } from 'vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
import type { SearchSession } from '@/types/search/search';
import type { OptionalDeepReadonly } from '@/types/common';

interface Props {
  session: OptionalDeepReadonly<SearchSession>;
  selectable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  selectable: false,
});

const selected = defineModel<boolean>('selected', { default: false });

const formattedDate = computed(() => {
  return new Date(props.session.updatedAt).toLocaleString();
});

const totalResults = computed(() => props.session.total || 0);
const pagesCaptured = computed(() => Object.keys(props.session.leadUrnsByPage).length);

const title = computed(() => props.session.searchTitle || props.session.id);
</script>

<template>
  <div class="search-preview" :class="{ selected }">
    <div v-if="selectable" class="selection-area">
      <AppCheckbox v-model="selected" @click.stop />
    </div>
    <div class="content">
      <div class="header">
        <h3 class="title">{{ title }}</h3>
        <span class="date">{{ formattedDate }}</span>
      </div>
      <div class="stats">
        <span class="stat"><strong>Results:</strong> {{ totalResults }}</span>
        <span class="stat"><strong>Pages:</strong> {{ pagesCaptured }}</span>
        <span v-if="session.source" class="stat source"><strong>Source:</strong> {{ session.source }}</span>
      </div>
      <div v-if="session.query" class="query" :title="session.query">
        {{ session.query }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-preview {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.search-preview:hover {
  background-color: #f9f9f9;
}

.search-preview.selected {
  background-color: #f0f7ff;
}

.selection-area {
  display: flex;
  align-items: center;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0a66c2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #475569;
}

.stat strong {
  font-weight: 600;
  color: #1e293b;
}

.source {
  text-transform: capitalize;
}

.query {
  font-size: 0.7rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
}
</style>
