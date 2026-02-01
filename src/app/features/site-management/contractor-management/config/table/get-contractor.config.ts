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

const CONTRACTOR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No contractor record found.',
};

const CONTRACTOR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'contractorName',
    header: 'Contractor Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      showImage: true,
      dummyImageField: 'contractorName',
      primaryFieldHighlight: true,
    },
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

const CONTRACTOR_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IContractorGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Contractor Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Contractor',
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Contractor Status',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Contractor',
  },
];

const CONTRACTOR_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IContractorGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Contractor',
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
