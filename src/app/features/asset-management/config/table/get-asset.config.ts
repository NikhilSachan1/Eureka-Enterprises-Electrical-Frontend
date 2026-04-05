import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  ETableActionTypeValue,
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
    showImage: true,
    icon: ICONS.ASSET.BOX,
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
    field: 'latestEvent.eventType',
    header: 'Handover Status',
    customTemplateKey: 'latestEventFlow',
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

export function buildAssetTableRowActionsConfig(
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IAssetGetResponseDto['records'][number]>>[] {
  return [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Asset Details',
      permission: [APP_PERMISSION.ASSET.VIEW_DETAIL],
    },
    {
      id: EButtonActionType.EVENT_HISTORY,
      tooltip: 'View Event History',
      permission: [APP_PERMISSION.ASSET.EVENT_HISTORY],
    },
    {
      id: EButtonActionType.HANDOVER_INITIATE,
      tooltip: 'Handover Asset',
      permission: [APP_PERMISSION.ASSET.HANDOVER_INITIATE],
      disableWhen: row =>
        row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED,
    },
    {
      id: EButtonActionType.HANDOVER_ACCEPTED,
      tooltip: 'Accept Allocation',
      permission: [APP_PERMISSION.ASSET.HANDOVER_ACCEPTED],
      disableWhen: row =>
        row.latestEvent?.eventType !==
          ETableActionTypeValue.HANDOVER_INITIATED ||
        !loggedInUserId ||
        row.latestEvent.toUser !== loggedInUserId,
    },
    {
      id: EButtonActionType.HANDOVER_REJECTED,
      tooltip: 'Reject Allocation',
      permission: [APP_PERMISSION.ASSET.HANDOVER_REJECTED],
      disableWhen: row =>
        row.latestEvent?.eventType !==
          ETableActionTypeValue.HANDOVER_INITIATED ||
        !loggedInUserId ||
        row.latestEvent.toUser !== loggedInUserId,
    },
    {
      id: EButtonActionType.HANDOVER_CANCELLED,
      tooltip: 'Cancel Allocation',
      permission: [APP_PERMISSION.ASSET.HANDOVER_CANCELLED],
      disableWhen: row =>
        row.latestEvent?.eventType !==
          ETableActionTypeValue.HANDOVER_INITIATED ||
        !loggedInUserId ||
        row.latestEvent.fromUser !== loggedInUserId,
    },
    {
      id: EButtonActionType.DEALLOCATE,
      tooltip: 'Deallocate Asset',
      permission: [APP_PERMISSION.ASSET.DEALLOCATE],
      disableWhen: row => row.status !== 'ASSIGNED',
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit Asset',
      permission: [APP_PERMISSION.ASSET.EDIT],
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete Asset',
      permission: [APP_PERMISSION.ASSET.DELETE],
    },
  ];
}

export const ASSET_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAssetGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Asset',
    permission: [APP_PERMISSION.ASSET.DELETE],
  },
];

export function createAssetTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IAssetGetResponseDto['records'][number]> {
  return {
    tableConfig: ASSET_TABLE_CONFIG,
    headers: ASSET_TABLE_HEADER_CONFIG,
    rowActions: buildAssetTableRowActionsConfig(loggedInUserId),
    bulkActions: ASSET_TABLE_BULK_ACTIONS_CONFIG,
  };
}
