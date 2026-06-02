import { handleCompanyProfileXhr } from '@/scripts/handle-company-profile-xhr';
import { handleLeadSearchXhr } from '@/scripts/handle-lead-search-xhr';

export default defineUnlistedScript(() => {
  handleCompanyProfileXhr();
  handleLeadSearchXhr();
});
