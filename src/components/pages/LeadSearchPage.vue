<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useLeads } from '@/composables/useLeads';
import { useSearchSessions } from '@/composables/useSearchSessions';
import LeadSearchPreview from '@/components/lead-search/LeadSearchPreview.vue';
import AppDivider from '@/components/ui/AppDivider.vue';
import AppCopyButton from '@/components/ui/AppCopyButton.vue';
import AppCheckbox from '@/components/ui/AppCheckbox.vue';
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

const getQueryPage = () => {
  if (!props.tabUrl) {
    return undefined;
  }

  try {
    const url = new URL(props.tabUrl);
    const page = url.searchParams.get('page');
    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        return pageNum;
      }
    }
  } catch (e) {
    console.error('Failed to parse tabUrl', e);
  }
};

watch(totalPages, (newTotal) => {
  const queryPage = getQueryPage();
  if (queryPage && newTotal && queryPage <= newTotal && queryPage > 0) {
    currentPage.value = queryPage - 1;
  }
}, { immediate: true });

const loadedPagesCount = computed(() => {
  if (!currentSession.value) return 0;
  return Object.keys(currentSession.value.leadUrnsByPage).length;
});

const loadedLeadsCount = computed(() => {
  return allSessionLeads.value.length;
});

const isPageLoaded = (page: number) => {
  if (!currentSession.value) return false;
  return currentSession.value?.leadUrnsByPage[page - 1]?.length > 0;
};

const changePage = (page: number) => {
  currentPage.value = page;
};

const showBulkCopyModal = ref(false);
const selectedUrns = ref<Set<string>>(new Set());

const selectedLeads = computed(() => {
  return leads.value.filter(l => selectedUrns.value.has(l.entityUrn));
});

const isPageSelected = computed(() => {
  if (displayedLeads.value.length === 0) return false;
  return displayedLeads.value.every(l => selectedUrns.value.has(l.entityUrn));
});

const isAllSelected = computed(() => {
  if (allSessionLeads.value.length === 0) return false;
  return allSessionLeads.value.every(l => selectedUrns.value.has(l.entityUrn));
});

const toggleLeadSelection = (urn: string, selected: boolean) => {
  if (selected) {
    selectedUrns.value.add(urn);
  } else {
    selectedUrns.value.delete(urn);
  }
};

const togglePageSelection = (selected: boolean) => {
  displayedLeads.value.forEach(l => {
    if (selected) {
      selectedUrns.value.add(l.entityUrn);
    } else {
      selectedUrns.value.delete(l.entityUrn);
    }
  });
};

const toggleAllSelection = (selected: boolean) => {
  allSessionLeads.value.forEach(l => {
    if (selected) {
      selectedUrns.value.add(l.entityUrn);
    } else {
      selectedUrns.value.delete(l.entityUrn);
    }
  });
};

const copySelected = () => {
  if (selectedLeads.value.length === 0) return;
  showBulkCopyModal.value = true;
};
</script>

<template>
  <div class="lead-search-page">
    <template v-if="displayedLeads.length">
      <div class="header-actions">
        <div class="selection-controls">
          <AppCheckbox
            :model-value="isAllSelected"
            label="Select All"
            @update:model-value="toggleAllSelection"
          />
          <AppCheckbox
            :model-value="isPageSelected"
            label="Select Page"
            @update:model-value="togglePageSelection"
          />

          <AppCopyButton
            :label="`Copy Selected (${selectedLeads.length})`"
            :primary="true"
            :disabled="selectedLeads.length === 0"
            class="copy-action"
            @click="copySelected"
          />
        </div>
      </div>

      <AppDivider />
    </template>

    <div v-if="displayedLeads.length" class="content-wrapper">
      <div class="leads-list">
        <LeadSearchPreview
          v-for="lead in displayedLeads"
          :key="lead.entityUrn"
          :lead="lead"
          :selected="selectedUrns.has(lead.entityUrn)"
          @update:selected="toggleLeadSelection(lead.entityUrn, $event)"
        />
      </div>
    </div>
    <div v-else class="no-data">
      No leads collected for this page yet.
    </div>

    <template v-if="totalPages > 0 && currentSession">
      <AppDivider />
      <div v-if="totalPages > 1" class="pagination">
        <button
          v-for="page in totalPages"
          :key="page"
          :class="{
            active: currentPage === page - 1,
            loaded: isPageLoaded(page)
          }"
          @click="changePage(page - 1)"
        >
          {{ page }}
        </button>
      </div>

      <div class="pages-info">
        Loaded {{ loadedPagesCount }}/{{ totalPages }} pages ({{ loadedLeadsCount }}/{{ currentSession.total }} leads)
      </div>
    </template>

    <BulkCopyModal
      v-if="showBulkCopyModal"
      :show="showBulkCopyModal"
      :leads="selectedLeads"
      :hero-card="currentSession?.heroCard"
      @close="showBulkCopyModal = false"
    />
  </div>
</template>

<style scoped>
.lead-search-page {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 12px;
}

.copy-action {
  margin-left: auto;
}

.selection-controls {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
}

.leads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 12px;
}

.no-data {
  flex-grow: 1;
}

.pages-info {
  padding: 4px;
  text-align: center;
  font-size: 0.85em;
  color: #666;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 8px 8px 4px;
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

.pagination button:not(.loaded):not(.active) {
  background: #f5f5f5;
  color: #999;
  border-color: #eee;
}
</style>
