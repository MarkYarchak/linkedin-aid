<script lang="ts" setup>
import { computed } from 'vue';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Company } from '@/types/company/company';

interface Props {
  company: OptionalDeepReadonly<Company>;
}
const props = defineProps<Props>();

const logoUrl = computed(() => {
  const company = props.company;
  if (company.main?.companyPictureDisplayImage) {
    const img = company.main.companyPictureDisplayImage;
    if (img.artifacts && img.artifacts.length > 0) {
      return img.rootUrl + img.artifacts[0].fileIdentifyingUrlPathSegment;
    }
  }
  return null;
});
</script>

<template>
  <div class="company-preview-dense">
    <AppAvatar
      :src="logoUrl"
      :alt="company.main?.name"
      shape="square"
      size="sm"
    />
    <div class="info">
      <div class="name">{{ company.main?.name }}</div>
      <div class="meta">
        <span v-if="company.main?.industry" class="industry">{{ company.main.industry }}</span>
        <span v-if="company.main?.industry && company.main?.location" class="separator"> &middot; </span>
        <span v-if="company.main?.location" class="location">{{ company.main.location }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-preview-dense {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-weight: 600;
  font-size: 0.9em;
  color: #0a66c2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.meta {
  font-size: 0.75em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.separator {
  margin: 0 2px;
}
</style>
