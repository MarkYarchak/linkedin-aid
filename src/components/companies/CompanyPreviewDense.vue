<script lang="ts" setup>
import { computed } from 'vue';
import { useDataStore } from '@/store/data-store';
import { getDisplayImageUrl } from '@/helpers/image-helper';
import { getEntityExpirationInfo } from '@/helpers/date-helper';
import AppAvatar from '@/components/ui/AppAvatar.vue';
import type { OptionalDeepReadonly } from '@/types/common';
import type { Company } from '@/types/company/company';
import type { DisplayImage } from '@/types/linkedin-common';

interface Props {
  company: OptionalDeepReadonly<Company>;
  showExpiration?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showExpiration: false,
});

const logoUrl = computed(() => {
  return getDisplayImageUrl(props.company.main?.companyPictureDisplayImage as DisplayImage);
});

const { entitiesTTL } = useDataStore();
const expirationInfo = computed(() => getEntityExpirationInfo(props.company.updatedAt, entitiesTTL.value));
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
    <span v-if="showExpiration && expirationInfo" class="expiration">{{ expirationInfo }}</span>
    <slot name="actions"></slot>
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

.expiration {
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.7rem;
}
</style>
