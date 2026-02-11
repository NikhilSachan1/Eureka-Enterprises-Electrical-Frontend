import { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const ASSET_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No asset record found.',
};

export const ASSET_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Asset Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'assetId' },
    showImage: false,
    dummyImageField: 'name',
    primaryFieldHighlight: true,
  },
  {
    field: 'category',
    header: 'Asset Category',
    serverSideFilterAndSortConfig: {
      filterField: 'assetCategory',
    },
    showSort: false,
  },
  {
    field: 'status',
    header: 'Asset Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'assetStatus',
    },
    showSort: false,
  },
  {
    field: 'assetAssigneeName',
    header: 'Assigned To',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'assetAssigneeCode' },
    showImage: true,
    dummyImageField: 'assetAssigneeName',
    primaryFieldHighlight: true,
    serverSideFilterAndSortConfig: {
      filterField: 'assetAssignee',
    },
    showSort: false,
  },
  {
    field: 'calibrationFrom',
    header: 'Calibration From',
    showSort: false,
  },
  {
    field: 'assetDocuments',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
  {
    field: 'calibrationStatus',
    header: 'Calibration Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'assetCalibrationStatus',
    },
    showSort: false,
  },
  {
    field: 'warrantyStatus',
    header: 'Warranty Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'assetWarrantyStatus',
    },
    showSort: false,
  },
];

export const ASSET_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAssetGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Asset Details',
  },
  {
    id: EButtonActionType.EVENT_HISTORY,
    tooltip: 'View Event History',
  },
  {
    id: EButtonActionType.HANDOVER_INITIATE,
    tooltip: 'Allocate Asset',
    // disableWhen: row => row.status === 'AVAILABLE',
  },
  {
    id: EButtonActionType.HANDOVER_ACCEPTED,
    tooltip: 'Accept Allocation',
    // hideWhen: row => row.status !== 'pending_handover',
  },
  {
    id: EButtonActionType.HANDOVER_REJECTED,
    tooltip: 'Reject Allocation',
    // hideWhen: row => row.status !== 'pending_handover',
  },
  {
    id: EButtonActionType.HANDOVER_CANCELLED,
    tooltip: 'Cancel Allocation',
    // hideWhen: row => row.status !== 'pending_handover',
  },
  {
    id: EButtonActionType.DEALLOCATE,
    tooltip: 'Deallocate Asset',
    // hideWhen: row => !row.assignedTo,
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Asset',
    // permission: 'asset.edit',
    // disableWhen: row => row.status === 'disposed',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Asset',
    // permission: 'asset.delete',
    //disableWhen: row => !!row.assignedTo,
  },
];

export const ASSET_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAssetGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Asset',
    // permission: 'asset.delete',
  },
];

export const ASSET_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IAssetGetResponseDto['records'][number]
> = {
  tableConfig: ASSET_TABLE_CONFIG,
  headers: ASSET_TABLE_HEADER_CONFIG,
  rowActions: ASSET_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: ASSET_TABLE_BULK_ACTIONS_CONFIG,
};
