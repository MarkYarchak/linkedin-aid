import type { DeepReadonly } from 'vue';

export type OptionalDeepReadonly<T> = T | DeepReadonly<T>;
