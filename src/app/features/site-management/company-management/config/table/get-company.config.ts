import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { ICompanyGetResponseDto } from '../../types/company.dto';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

const COMPANY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No company record found.',
};

const COMPANY_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'companyName',
    header: 'Company Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'companyName',
    primaryFieldHighlight: true,
    subtitle: { field: 'parentCompanyName' },
  },
  {
    field: 'status',
    header: 'Company Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'companyStatus',
    },
    showSort: false,
  },
  {
    field: 'stateCity',
    header: 'Location',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'pincode' },
    serverSideFilterAndSortConfig: {
      filterField: 'location',
    },
    showSort: false,
  },
  {
    field: 'emailAddress',
    header: 'Contact',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'contactNumber' },
    showSort: false,
  },
];

const COMPANY_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICompanyGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Company Details',
    permission: [APP_PERMISSION.COMPANY.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Company',
    permission: [APP_PERMISSION.COMPANY.EDIT],
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Company Status',
    permission: [APP_PERMISSION.COMPANY.CHANGE_STATUS],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Company',
    permission: [APP_PERMISSION.COMPANY.DELETE],
  },
];

const COMPANY_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICompanyGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Company',
    permission: [APP_PERMISSION.COMPANY.DELETE],
  },
];

export const COMPANY_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  ICompanyGetResponseDto['records'][number]
> = {
  tableConfig: COMPANY_TABLE_CONFIG,
  headers: COMPANY_TABLE_HEADER_CONFIG,
  rowActions: COMPANY_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: COMPANY_TABLE_BULK_ACTIONS_CONFIG,
};
