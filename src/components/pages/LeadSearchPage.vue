<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useLeads } from '@/composables/useLeads';
import { useSearchSessions } from '@/composables/useSearchSessions';
import LeadSearchPreview from '@/components/lead-search/LeadSearchPreview.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppCopyButton from '@/components/ui/AppCopyButton.vue';
import BulkCopyModal from '@/components/modals/BulkCopyModal.vue';
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

const allSessionLeads = computed(() => {
  if (currentSession.value) {
    const allUrns = Object.values(currentSession.value.leadUrnsByPage).flat();
    const uniqueUrns = [...new Set(allUrns)];
    return uniqueUrns.map(urn => leads.value.find(l => l.entityUrn === urn)).filter(Boolean) as Lead[];
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
  return allSessionLeads.value.length;
});

const changePage = (page: number) => {
  currentPage.value = page;
};

const showBulkCopyModal = ref(false);
const leadsToCopy = ref<Lead[]>([]);

const copyCurrentPage = () => {
  if (displayedLeads.value.length === 0) return;
  leadsToCopy.value = displayedLeads.value;
  showBulkCopyModal.value = true;
};

const copyAllPages = () => {
  if (allSessionLeads.value.length === 0) return;
  leadsToCopy.value = allSessionLeads.value;
  showBulkCopyModal.value = true;
};
</script>

<template>
  <div class="lead-search-page">
    <template v-if="totalPages > 0 && currentSession">
      <div class="header-actions">
        <div class="pages-info">
          Loaded {{ loadedPagesCount }}/{{ totalPages }} pages ({{ loadedLeadsCount }}/{{ currentSession.total }} leads)
        </div>

        <div class="copy-actions">
          <AppCopyButton
            label="Copy Page"
            :disabled="displayedLeads.length === 0 || totalPages <= 1"
            @click="copyCurrentPage"
          />
          <AppCopyButton
            label="Copy All"
            :primary="true"
            :disabled="allSessionLeads.length === 0"
            @click="copyAllPages"
          />
        </div>
      </div>

      <AppDivider class="mt-3 mb-3" />
    </template>

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

    <BulkCopyModal
      v-if="showBulkCopyModal"
      :show="showBulkCopyModal"
      :leads="leadsToCopy"
      @close="showBulkCopyModal = false"
    />
  </div>
</template>

<style scoped>
.lead-search-page {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.copy-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.copy-actions > * {
  flex: 1;
  justify-content: center;
}

.pages-info {
  text-align: center;
  font-size: 0.85em;
  color: #666;
}

.leads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
