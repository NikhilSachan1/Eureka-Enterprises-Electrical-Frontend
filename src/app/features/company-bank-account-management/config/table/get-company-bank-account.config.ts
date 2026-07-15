import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { ICompanyBankAccountGetResponseDto } from '../../types/company-bank-account.dto';
import { ICONS } from '@shared/constants';

export const COMPANY_BANK_ACCOUNT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No company bank account record found.',
};

export const COMPANY_BANK_ACCOUNT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'bankNameDisplay',
      header: 'Bank Name',
      icon: ICONS.BANK.ACCOUNT,
      showImage: true,
      dummyImageField: 'bankNameDisplay',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'accountHolderName' },
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'accountNumber',
      header: 'Account Number',
      showSort: false,
    },
    {
      field: 'ifscCode',
      header: 'IFSC Code',
      showSort: false,
    },
    {
      field: 'branchName',
      header: 'Branch',
      showSort: false,
    },
    {
      field: 'status',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'addedAt',
      header: 'Added On',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
  ];

export const COMPANY_BANK_ACCOUNT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICompanyBankAccountGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Company Bank Account',
    permission: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.EDIT],
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Bank Account Status',
    permission: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Company Bank Account',
    permission: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.DELETE],
  },
];

export const COMPANY_BANK_ACCOUNT_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICompanyBankAccountGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Company Bank Account',
    permission: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.DELETE],
  },
];

export const COMPANY_BANK_ACCOUNT_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  ICompanyBankAccountGetResponseDto['records'][number]
> = {
  tableConfig: COMPANY_BANK_ACCOUNT_TABLE_CONFIG,
  headers: COMPANY_BANK_ACCOUNT_TABLE_HEADER_CONFIG,
  rowActions: COMPANY_BANK_ACCOUNT_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: COMPANY_BANK_ACCOUNT_TABLE_BULK_ACTIONS_CONFIG,
};
