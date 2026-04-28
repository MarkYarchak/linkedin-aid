import { handleAccountProfileXhr } from '@/background/handle-account-profile-xhr';

export default defineUnlistedScript(() => {
  handleAccountProfileXhr();
});
