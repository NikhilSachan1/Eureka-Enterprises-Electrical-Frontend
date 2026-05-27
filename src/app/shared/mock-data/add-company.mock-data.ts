import { ICompanyAddFormDto } from '@features/site-management/company-management/types/company.dto';
import { getRandomItem, TEST_INDIA_STATES } from './mock-data.constants';

export const ADD_COMPANY_PREFILLED_DATA: ICompanyAddFormDto = {
  companyName: 'Test Company',
  state: getRandomItem(TEST_INDIA_STATES),
  city: 'Test City',
  pincode: '123456',
  parentCompanyName: null,
};
