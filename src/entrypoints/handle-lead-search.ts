import { handleLeadSearchXhr } from '@/scripts/handle-lead-search-xhr';
import { handlePersonasXhr } from '@/scripts/handle-personas-xhr';

export default defineUnlistedScript(() => {
  handleLeadSearchXhr();
  handlePersonasXhr();
});
