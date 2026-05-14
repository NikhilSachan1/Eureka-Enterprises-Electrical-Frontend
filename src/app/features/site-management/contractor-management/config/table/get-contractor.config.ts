import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IContractorGetResponseDto } from '../../types/contractor.dto';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

const CONTRACTOR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No contractor record found.',
};

const CONTRACTOR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Contractor Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'name',
    primaryFieldHighlight: true,
  },
  {
    field: 'gstNumber',
    header: 'GST Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'status',
    header: 'Contractor Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'contractorStatus',
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
    field: 'email',
    header: 'Contact',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'contactNumber' },
    showSort: false,
  },
];

const CONTRACTOR_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IContractorGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Contractor Details',
    permission: [APP_PERMISSION.CONTRACTOR.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Contractor',
    permission: [APP_PERMISSION.CONTRACTOR.EDIT],
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Contractor Status',
    permission: [APP_PERMISSION.CONTRACTOR.CHANGE_STATUS],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Contractor',
    permission: [APP_PERMISSION.CONTRACTOR.DELETE],
  },
];

const CONTRACTOR_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IContractorGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Contractor',
    permission: [APP_PERMISSION.CONTRACTOR.DELETE],
  },
];

export const CONTRACTOR_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IContractorGetResponseDto['records'][number]
> = {
  tableConfig: CONTRACTOR_TABLE_CONFIG,
  headers: CONTRACTOR_TABLE_HEADER_CONFIG,
  rowActions: CONTRACTOR_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: CONTRACTOR_TABLE_BULK_ACTIONS_CONFIG,
};
