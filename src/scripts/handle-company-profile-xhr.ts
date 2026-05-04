import { handleXhr } from '@/scripts/xhr-interceptor';
import { MessageType } from '@/constants/message-types';
import { postWindowMessage } from '@/content/window-messages';
import type { SalesApiCompanies } from '@/types/company/salesApiCompanies';
import type { SalesApiCompanies2 } from '@/types/company/salesApiCompanies2';

export function handleCompanyProfileXhr() {
  handleXhr<SalesApiCompanies>(
    /\/sales-api\/salesApiCompanies\/.*(?=.*companyPictureDisplayImage)(?=.*description)(?=.*industry)/,
    (data, url) => {
      postWindowMessage({
        type: MessageType.COMPANY_CAPTURED,
        url,
        data,
      });
    },
  );

  handleXhr<SalesApiCompanies2>(
    /\/sales-api\/salesApiCompanies\/.*decoration=(?!.*(description|industry)).*employeeCount/,
    (data, url) => {
      postWindowMessage({
        type: MessageType.COMPANY_EXTRA_CAPTURED,
        url,
        data,
      });
    },
  );
}
