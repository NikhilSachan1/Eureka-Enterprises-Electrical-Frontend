import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import { EAssetStatus } from '@features/asset-management/types/asset.enum';
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
    field: 'calibrationDocuments',
    header: 'Calibration File',
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

type AssetTableRow = IAssetGetResponseDto['records'][number];

/** Handover is no longer in a pending “initiated” state (accepted / rejected / cancelled). */
const TERMINAL_HANDOVER_EVENT_TYPES = new Set<string>([
  ETableActionTypeValue.HANDOVER_ACCEPTED,
  ETableActionTypeValue.HANDOVER_REJECTED,
  ETableActionTypeValue.HANDOVER_CANCELLED,
]);

/** Lost and retired assets take no changes: a lost one only recovery, a retired one nothing at all. */
function getClosedAssetReason(row: AssetTableRow): string | undefined {
  if (row.status === EAssetStatus.LOST) {
    return 'This asset is marked as lost. Mark it as recovered first.';
  }
  if (row.status === EAssetStatus.RETIRED) {
    return 'This asset is retired and can no longer be changed.';
  }
  return undefined;
}

function getDeleteDisableReason(row: AssetTableRow): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (row.status === EAssetStatus.ASSIGNED) {
    return 'First deallocate the asset from the assignee before deleting.';
  }
  return undefined;
}

function isHandoverInitiateDisabled(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): boolean {
  if (getClosedAssetReason(row)) {
    return true;
  }
  if (row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED) {
    return true;
  }
  if (row.status === EAssetStatus.ASSIGNED) {
    return !loggedInUserId || row.assignedTo !== loggedInUserId;
  }
  return false;
}

function getHandoverInitiateDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED) {
    return 'Request is already initiated.';
  }
  if (row.status === EAssetStatus.ASSIGNED) {
    if (!loggedInUserId || row.assignedTo !== loggedInUserId) {
      return 'Only the assigned user can initiate handover for this asset.';
    }
  }
  return undefined;
}

function isHandoverAcceptRejectDisabled(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): boolean {
  return (
    !!getClosedAssetReason(row) ||
    row.latestEvent?.eventType !== ETableActionTypeValue.HANDOVER_INITIATED ||
    !loggedInUserId ||
    row.latestEvent.toUser !== loggedInUserId
  );
}

/**
 * 1) Terminal status — allocation already completed.
 * 2) No pending initiated request.
 * 3) Current user is not the assignee (cannot accept/reject).
 */
function getHandoverAcceptRejectDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  if (!isHandoverAcceptRejectDisabled(row, loggedInUserId)) {
    return undefined;
  }
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  const eventType = row.latestEvent?.eventType;
  if (eventType !== ETableActionTypeValue.HANDOVER_INITIATED) {
    return 'No allocation request is pending. The handover must be initiated first.';
  }
  if (!loggedInUserId || row.latestEvent?.toUser !== loggedInUserId) {
    return 'You are not authorized to accept or reject this allocation. Only the assigned user can respond.';
  }
  return undefined;
}

function isHandoverCancelDisabled(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): boolean {
  return (
    !!getClosedAssetReason(row) ||
    row.latestEvent?.eventType !== ETableActionTypeValue.HANDOVER_INITIATED ||
    !loggedInUserId ||
    row.latestEvent.fromUser !== loggedInUserId
  );
}

/**
 * 1) Terminal status — allocation already completed.
 * 2) No pending initiated request.
 * 3) Current user is not the initiator (cannot cancel).
 */
function getHandoverCancelDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  if (!isHandoverCancelDisabled(row, loggedInUserId)) {
    return undefined;
  }
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  const eventType = row.latestEvent?.eventType;
  if (eventType && TERMINAL_HANDOVER_EVENT_TYPES.has(eventType)) {
    return 'This allocation request has already been completed.';
  }
  if (eventType !== ETableActionTypeValue.HANDOVER_INITIATED) {
    return 'No allocation request is pending. The handover must be initiated first.';
  }
  if (!loggedInUserId || row.latestEvent?.fromUser !== loggedInUserId) {
    return 'You are not authorized to cancel this allocation. Only the user who initiated the request can cancel.';
  }
  return undefined;
}

/** Mirrors the backend: a lost or retired asset, or one with a pending handover, cannot be marked lost. */
function getMarkLostDisableReason(row: AssetTableRow): string | undefined {
  if (row.status === EAssetStatus.LOST) {
    return 'This asset is already marked as lost.';
  }
  if (row.status === EAssetStatus.RETIRED) {
    return 'A retired asset cannot be marked as lost.';
  }
  if (row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED) {
    return 'Cancel or complete the pending handover first.';
  }
  return undefined;
}

/** The backend keeps the assignee on retire, so the asset has to be deallocated first. */
function getRetireDisableReason(row: AssetTableRow): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED) {
    return 'Cancel or complete the pending handover first.';
  }
  if (row.status === EAssetStatus.ASSIGNED) {
    return 'First deallocate the asset from the assignee before retiring.';
  }
  return undefined;
}

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
      id: EButtonActionType.QR_CODE,
      tooltip: 'Download QR Code',
      permission: [APP_PERMISSION.ASSET.VIEW_DETAIL],
    },
    {
      id: EButtonActionType.DOWNLOAD,
      tooltip: 'Export Asset Report',
      permission: [APP_PERMISSION.ASSET.EXPORT],
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
      disableWhen: row => isHandoverInitiateDisabled(row, loggedInUserId),
      disableReason: row =>
        getHandoverInitiateDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.HANDOVER_ACCEPTED,
      tooltip: 'Accept Allocation',
      permission: [APP_PERMISSION.ASSET.HANDOVER_ACCEPTED],
      disableWhen: row => isHandoverAcceptRejectDisabled(row, loggedInUserId),
      disableReason: row =>
        getHandoverAcceptRejectDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.HANDOVER_REJECTED,
      tooltip: 'Reject Allocation',
      permission: [APP_PERMISSION.ASSET.HANDOVER_REJECTED],
      disableWhen: row => isHandoverAcceptRejectDisabled(row, loggedInUserId),
      disableReason: row =>
        getHandoverAcceptRejectDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.HANDOVER_CANCELLED,
      tooltip: 'Cancel Allocation',
      permission: [APP_PERMISSION.ASSET.HANDOVER_CANCELLED],
      disableWhen: row => isHandoverCancelDisabled(row, loggedInUserId),
      disableReason: row => getHandoverCancelDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.DEALLOCATE,
      tooltip: 'Deallocate Asset',
      permission: [APP_PERMISSION.ASSET.DEALLOCATE],
      disableWhen: row => row.status !== EAssetStatus.ASSIGNED,
      disableReason: (row): string | undefined => {
        const closedReason = getClosedAssetReason(row);
        if (closedReason) {
          return closedReason;
        }
        return row.status !== EAssetStatus.ASSIGNED
          ? 'Asset is not allocated.'
          : undefined;
      },
    },
    {
      id: EButtonActionType.MARK_LOST,
      tooltip: 'Mark as Lost',
      permission: [APP_PERMISSION.ASSET.MARK_LOST],
      disableWhen: row => getMarkLostDisableReason(row) !== undefined,
      disableReason: row => getMarkLostDisableReason(row),
    },
    {
      id: EButtonActionType.MARK_RECOVERED,
      tooltip: 'Mark as Recovered',
      permission: [APP_PERMISSION.ASSET.MARK_RECOVERED],
      disableWhen: row => row.status !== EAssetStatus.LOST,
      disableReason: row =>
        row.status !== EAssetStatus.LOST
          ? 'Only an asset marked as lost can be recovered.'
          : undefined,
    },
    {
      id: EButtonActionType.RETIRED,
      tooltip: 'Retire Asset',
      permission: [APP_PERMISSION.ASSET.RETIRE],
      disableWhen: row => getRetireDisableReason(row) !== undefined,
      disableReason: row => getRetireDisableReason(row),
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit Asset',
      permission: [APP_PERMISSION.ASSET.EDIT],
      disableWhen: row => getClosedAssetReason(row) !== undefined,
      disableReason: row => getClosedAssetReason(row),
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete Asset',
      permission: [APP_PERMISSION.ASSET.DELETE],
      disableWhen: row => getDeleteDisableReason(row) !== undefined,
      disableReason: row => getDeleteDisableReason(row),
    },
  ];
}

export const ASSET_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAssetGetResponseDto['records'][number]>
>[] = [
  {
    id: EButtonActionType.QR_CODE,
    label: 'Print QR',
    tooltip: 'Print QR codes for selected assets',
    permission: [APP_PERMISSION.ASSET.VIEW_DETAIL],
  },
  {
    id: EButtonActionType.DOWNLOAD,
    label: 'Export',
    tooltip: 'Export selected assets as PDF',
    permission: [APP_PERMISSION.ASSET.EXPORT],
  },
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Asset',
    permission: [APP_PERMISSION.ASSET.DELETE],
    disableWhen: row => getDeleteDisableReason(row) !== undefined,
    disableReason: row => getDeleteDisableReason(row),
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
