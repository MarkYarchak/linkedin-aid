import { handleCompanyProfileXhr } from '@/scripts/handle-company-profile-xhr';
import { handleLeadSearchXhr } from '@/scripts/handle-lead-search-xhr';
import { handlePersonasXhr } from '@/scripts/handle-personas-xhr';

export default defineUnlistedScript(() => {
  handleCompanyProfileXhr();
  handleLeadSearchXhr();
  handlePersonasXhr();
});
