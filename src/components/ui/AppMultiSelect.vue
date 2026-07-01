<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  options: { label: string; value: any }[];
  placeholder?: string;
  label?: string;
  displayMode?: 'count' | 'labels';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select items...',
  displayMode: 'count',
});

const modelValue = defineModel<any[]>({ default: () => [] });

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
});

const isAllSelected = computed(() => {
  return props.options.length > 0 && modelValue.value.length === props.options.length;
});

const toggleAll = () => {
  if (isAllSelected.value) {
    modelValue.value = [];
  } else {
    modelValue.value = props.options.map(opt => opt.value);
  }
};

const toggleItem = (value: any) => {
  const newValue = [...modelValue.value];
  const index = newValue.indexOf(value);
  if (index === -1) {
    newValue.push(value);
  } else {
    newValue.splice(index, 1);
  }
  modelValue.value = newValue;
};

const displayText = computed(() => {
  if (modelValue.value.length === 0) return props.placeholder;
  if (modelValue.value.length === props.options.length) return 'All selected';

  if (props.displayMode === 'labels') {
    return modelValue.value
      .map(val => props.options.find(opt => opt.value === val)?.label)
      .filter(label => !!label)
      .join(', ');
  }

  return `${modelValue.value.length} items selected`;
});
</script>

<template>
  <div ref="containerRef" class="app-multi-select">
    <label v-if="label" class="multi-select-label">{{ label }}</label>
    <div class="dropdown-trigger" :class="{ 'is-open': isOpen }" @click="toggleDropdown">
      <span class="display-text">{{ displayText }}</span>
      <span class="chevron" :class="{ 'is-open': isOpen }">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </span>
    </div>

    <transition name="fade">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-item select-all" @click.stop="toggleAll">
          <div class="checkbox-box" :class="{ checked: isAllSelected }">
            <svg v-if="isAllSelected" viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
            </svg>
          </div>
          <span class="item-label">Select All</span>
        </div>

        <div class="divider"></div>

        <div class="options-container">
          <div
            v-for="opt in options"
            :key="opt.value"
            class="dropdown-item"
            @click.stop="toggleItem(opt.value)"
          >
            <div class="checkbox-box" :class="{ checked: modelValue.includes(opt.value) }">
              <svg v-if="modelValue.includes(opt.value)" viewBox="0 0 24 24" class="check-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
              </svg>
            </div>
            <span class="item-label">{{ opt.label }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.app-multi-select {
  position: relative;
  width: 100%;
}

.multi-select-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.dropdown-trigger:hover {
  border-color: #0a66c2;
}

.dropdown-trigger.is-open {
  border-color: #0a66c2;
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
}

.display-text {
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  display: flex;
  align-items: center;
  color: #64748b;
  transition: transform 0.2s ease;
}

.chevron.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  max-height: 300px;
  overflow-y: auto;
}

.options-container {
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.item-label {
  font-size: 0.85rem;
  color: #334155;
}

.checkbox-box {
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
  flex-shrink: 0;
}

.checkbox-box.checked {
  background: #0a66c2;
  border-color: #0a66c2;
}

.check-icon {
  width: 12px;
  height: 12px;
  color: white;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

.select-all {
  font-weight: 600;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
