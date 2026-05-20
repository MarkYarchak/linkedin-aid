<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useLeads } from '@/composables/useLeads';
import { useSearchSessions } from '@/composables/useSearchSessions';
import LeadSearchPreview from '@/components/lead-search/LeadSearchPreview.vue';
import type { Lead } from '@/types/lead/lead';

interface Props {
  tabUrl?: string;
}
const props = defineProps<Props>();

const { leads } = useLeads(props.tabUrl);
const { currentSession } = useSearchSessions(props.tabUrl);

const displayedLeads = computed(() => {
  if (currentSession.value) {
    const urns = currentSession.value.leadUrnsByPage[currentPage.value] || [];
    return urns.map(urn => leads.value.find(l => l.entityUrn === urn)).filter(Boolean) as Lead[];
  }

  return [];
});

const currentPage = ref(0);
const totalPages = computed(() => {
  if (!currentSession.value) return 0;
  return Math.ceil(currentSession.value.total / currentSession.value.pageSize);
});

const loadedPagesCount = computed(() => {
  if (!currentSession.value) return 0;
  return Object.keys(currentSession.value.leadUrnsByPage).length;
});

const loadedLeadsCount = computed(() => {
  if (!currentSession.value) return 0;
  const allUrns = Object.values(currentSession.value.leadUrnsByPage).flat();
  return new Set(allUrns).size;
});

const changePage = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <div class="lead-search-page">
    <div v-if="displayedLeads.length" class="leads-list">
      <LeadSearchPreview
        v-for="lead in displayedLeads"
        :key="lead.entityUrn"
        :lead="lead"
      />
    </div>
    <div v-else class="no-data">
      No leads collected for this page yet.
    </div>

    <div v-if="totalPages > 0 && currentSession" class="pages-info">
      Loaded {{ loadedPagesCount }}/{{ totalPages }} pages ({{ loadedLeadsCount }}/{{ currentSession.total }} leads)
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: currentPage === page - 1 }"
        @click="changePage(page - 1)"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lead-search-page {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.leads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pages-info {
  margin-top: 15px;
  text-align: center;
  font-size: 0.85em;
  color: #666;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 15px;
  justify-content: center;
}

.pagination button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
}

.pagination button.active {
  background: #0a66c2;
  color: white;
  border-color: #0a66c2;
}
</style>
