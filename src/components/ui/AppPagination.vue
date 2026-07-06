<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

interface Props {
  modelValue: number;
  totalItems: number;
  pageSize?: number;
  isPageHighlighted?: (page: number) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 50,
  isPageHighlighted: () => false,
});

const emit = defineEmits(['update:modelValue']);

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize));

const jumpPage = ref(props.modelValue);
watch(() => props.modelValue, (newVal) => {
  jumpPage.value = newVal;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:modelValue', page);
  }
};

const onJumpSubmit = () => {
  let page = Math.floor(jumpPage.value);
  if (isNaN(page)) {
    jumpPage.value = props.modelValue;
    return;
  }
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  goToPage(page);
};

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = props.modelValue;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 4) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    let adjustedStart = start;
    let adjustedEnd = end;

    if (current <= 4) {
      adjustedStart = 2;
      adjustedEnd = 5;
    } else if (current >= total - 3) {
      adjustedStart = total - 4;
      adjustedEnd = total - 1;
    }

    for (let i = adjustedStart; i <= adjustedEnd; i++) {
      pages.push(i);
    }

    if (current < total - 3) {
      pages.push('...');
    }

    pages.push(total);
  }

  return pages;
});
</script>

<template>
  <div v-if="totalPages > 1" class="app-pagination">
    <div class="pagination-main">
      <button
        :disabled="modelValue <= 1"
        title="Previous"
        class="pagination-button prev-next"
        @click="goToPage(modelValue - 1)"
      >
        &laquo;
      </button>

      <div class="page-list">
        <template v-for="(page, index) in visiblePages" :key="index">
          <span v-if="page === '...'" class="pagination-ellipsis">...</span>
          <button
            v-else
            :class="{
              active: modelValue === page,
              highlighted: isPageHighlighted?.(page as number) && modelValue !== page
            }"
            class="pagination-button page-num"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <button
        :disabled="modelValue >= totalPages"
        title="Next"
        class="pagination-button prev-next"
        @click="goToPage(modelValue + 1)"
      >
        &raquo;
      </button>
    </div>

    <div class="pagination-jump">
      <span>Go to page</span>
      <input
        type="number"
        v-model.number="jumpPage"
        class="jump-input"
        min="1"
        :max="totalPages"
        @keyup.enter="onJumpSubmit"
        @blur="onJumpSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.app-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.pagination-main {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-list {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button.prev-next {
  font-size: 1rem;
  line-height: 1;
}

.pagination-button:hover:not(:disabled):not(.active) {
  border-color: #0a66c2;
  color: #0a66c2;
}

.pagination-button.active {
  background: #0a66c2;
  border-color: #0a66c2;
  color: white;
  cursor: default;
}

.pagination-button.highlighted {
  background: #f0f7ff;
  border-color: #0a66c2;
  color: #0a66c2;
}

.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-ellipsis {
  font-size: 0.75rem;
  color: #94a3b8;
  padding: 0 2px;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.jump-input {
  width: 48px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  background: white;
  color: #1e293b;
}

.jump-input:focus {
  border-color: #0a66c2;
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
}

/* Hide arrows for Chrome, Safari, Edge, Opera */
.jump-input::-webkit-outer-spin-button,
.jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Hide arrows for Firefox */
.jump-input[type=number] {
  -moz-appearance: textfield;
}
</style>
