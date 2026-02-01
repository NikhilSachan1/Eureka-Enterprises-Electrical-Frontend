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

const COMPANY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No company record found.',
};

const COMPANY_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'companyName',
    header: 'Company Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      showImage: true,
      dummyImageField: 'companyName',
      primaryFieldHighlight: true,
      secondaryField: 'parentCompanyName',
    },
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
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'pincode',
    },
    serverSideFilterAndSortConfig: {
      filterField: 'location',
    },
    showSort: false,
  },
  {
    field: 'emailAddress',
    header: 'Contact',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'contactNumber',
    },
    showSort: false,
  },
];

const COMPANY_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICompanyGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Company Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Company',
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Company Status',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Company',
  },
];

const COMPANY_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICompanyGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Company',
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
