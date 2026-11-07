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
    header: 'Last Handover Status',
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

/** Checks a permission of the logged-in user. The table config is plain data, so the component passes this in. */
export type AssetPermissionChecker = (permission: string) => boolean;

/** Request types that are finished, so nothing is pending any more. */
const TERMINAL_REQUEST_EVENT_TYPES = new Set<string>([
  ETableActionTypeValue.HANDOVER_ACCEPTED,
  ETableActionTypeValue.HANDOVER_REJECTED,
  ETableActionTypeValue.HANDOVER_CANCELLED,
  ETableActionTypeValue.RETURN_ACCEPTED,
  ETableActionTypeValue.RETURN_REJECTED,
  ETableActionTypeValue.RETURN_CANCELLED,
]);

function isHandoverPending(row: AssetTableRow): boolean {
  return (
    row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED
  );
}

/** The holder asked to return the asset to the office and nobody has answered yet. */
export function isReturnPending(row: AssetTableRow): boolean {
  return row.latestEvent?.eventType === ETableActionTypeValue.RETURN_INITIATED;
}

/** Only one request at a time: a pending handover or return blocks every other change of holder. */
function hasPendingRequest(row: AssetTableRow): boolean {
  return isHandoverPending(row) || isReturnPending(row);
}

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

function getHandoverInitiateDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (hasPendingRequest(row)) {
    return 'Request is already initiated.';
  }
  if (row.status === EAssetStatus.ASSIGNED) {
    if (!loggedInUserId || row.assignedTo !== loggedInUserId) {
      return 'Only the assigned user can initiate handover for this asset.';
    }
  }
  return undefined;
}

function getReturnToOfficeDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (hasPendingRequest(row)) {
    return 'Request is already initiated.';
  }
  if (row.status !== EAssetStatus.ASSIGNED) {
    return 'Only an assigned asset can be returned to the office.';
  }
  if (!loggedInUserId || row.assignedTo !== loggedInUserId) {
    return 'Only the assigned user can return this asset to the office.';
  }
  return undefined;
}

/**
 * Accept and reject are the same buttons for both requests:
 * - Handover: only the target user, with the handover permission.
 * - Return to office: office staff with the return permission, but not the person returning it.
 */
function getRequestResponseDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined,
  can: AssetPermissionChecker,
  permissions: { handover: string; return: string }
): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (isReturnPending(row)) {
    if (!can(permissions.return)) {
      return 'You are not authorized to respond to this return. Only office staff with return permission can respond.';
    }
    if (!loggedInUserId || row.latestEvent?.fromUser === loggedInUserId) {
      return 'You cannot respond to a return you initiated yourself.';
    }
    return undefined;
  }
  if (!isHandoverPending(row)) {
    return 'No handover or return request is pending.';
  }
  if (
    !can(permissions.handover) ||
    !loggedInUserId ||
    row.latestEvent?.toUser !== loggedInUserId
  ) {
    return 'You are not authorized to accept or reject this allocation. Only the assigned user can respond.';
  }
  return undefined;
}

/** Only the person who started the handover or the return can cancel it. */
function getRequestCancelDisableReason(
  row: AssetTableRow,
  loggedInUserId: string | null | undefined,
  can: AssetPermissionChecker
): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (!hasPendingRequest(row)) {
    const eventType = row.latestEvent?.eventType;
    return eventType && TERMINAL_REQUEST_EVENT_TYPES.has(eventType)
      ? 'This request has already been completed.'
      : 'No handover or return request is pending.';
  }
  const permission = isReturnPending(row)
    ? APP_PERMISSION.ASSET.RETURN_CANCELLED
    : APP_PERMISSION.ASSET.HANDOVER_CANCELLED;
  if (
    !can(permission) ||
    !loggedInUserId ||
    row.latestEvent?.fromUser !== loggedInUserId
  ) {
    return 'You are not authorized to cancel this request. Only the user who initiated the request can cancel.';
  }
  return undefined;
}

function getDeallocateDisableReason(row: AssetTableRow): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (row.status !== EAssetStatus.ASSIGNED) {
    return 'Asset is not allocated.';
  }
  if (isReturnPending(row)) {
    return 'A return to office is pending. Accept, reject or cancel it first.';
  }
  return undefined;
}

/** Mirrors the backend: a lost or retired asset, or one with a pending request, cannot be marked lost. */
function getMarkLostDisableReason(row: AssetTableRow): string | undefined {
  if (row.status === EAssetStatus.LOST) {
    return 'This asset is already marked as lost.';
  }
  if (row.status === EAssetStatus.RETIRED) {
    return 'A retired asset cannot be marked as lost.';
  }
  if (hasPendingRequest(row)) {
    return 'Cancel or complete the pending handover or return first.';
  }
  return undefined;
}

/** The backend keeps the assignee on retire, so the asset has to be deallocated first. */
function getRetireDisableReason(row: AssetTableRow): string | undefined {
  const closedReason = getClosedAssetReason(row);
  if (closedReason) {
    return closedReason;
  }
  if (hasPendingRequest(row)) {
    return 'Cancel or complete the pending handover or return first.';
  }
  if (row.status === EAssetStatus.ASSIGNED) {
    return 'First deallocate the asset from the assignee before retiring.';
  }
  return undefined;
}

export function buildAssetTableRowActionsConfig(
  loggedInUserId: string | undefined | null,
  can: AssetPermissionChecker
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
      disableWhen: row =>
        getHandoverInitiateDisableReason(row, loggedInUserId) !== undefined,
      disableReason: row =>
        getHandoverInitiateDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.RETURN_TO_OFFICE,
      tooltip: 'Return to Office',
      permission: [APP_PERMISSION.ASSET.RETURN_INITIATE],
      disableWhen: row =>
        getReturnToOfficeDisableReason(row, loggedInUserId) !== undefined,
      disableReason: row => getReturnToOfficeDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.HANDOVER_ACCEPTED,
      tooltip: 'Accept Request',
      permission: [
        APP_PERMISSION.ASSET.HANDOVER_ACCEPTED,
        APP_PERMISSION.ASSET.RETURN_ACCEPTED,
      ],
      disableWhen: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.ASSET.HANDOVER_ACCEPTED,
          return: APP_PERMISSION.ASSET.RETURN_ACCEPTED,
        }) !== undefined,
      disableReason: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.ASSET.HANDOVER_ACCEPTED,
          return: APP_PERMISSION.ASSET.RETURN_ACCEPTED,
        }),
    },
    {
      id: EButtonActionType.HANDOVER_REJECTED,
      tooltip: 'Reject Request',
      permission: [
        APP_PERMISSION.ASSET.HANDOVER_REJECTED,
        APP_PERMISSION.ASSET.RETURN_REJECTED,
      ],
      disableWhen: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.ASSET.HANDOVER_REJECTED,
          return: APP_PERMISSION.ASSET.RETURN_REJECTED,
        }) !== undefined,
      disableReason: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.ASSET.HANDOVER_REJECTED,
          return: APP_PERMISSION.ASSET.RETURN_REJECTED,
        }),
    },
    {
      id: EButtonActionType.HANDOVER_CANCELLED,
      tooltip: 'Cancel Request',
      permission: [
        APP_PERMISSION.ASSET.HANDOVER_CANCELLED,
        APP_PERMISSION.ASSET.RETURN_CANCELLED,
      ],
      disableWhen: row =>
        getRequestCancelDisableReason(row, loggedInUserId, can) !== undefined,
      disableReason: row =>
        getRequestCancelDisableReason(row, loggedInUserId, can),
    },
    {
      id: EButtonActionType.DEALLOCATE,
      tooltip: 'Deallocate Asset',
      permission: [APP_PERMISSION.ASSET.DEALLOCATE],
      disableWhen: row => getDeallocateDisableReason(row) !== undefined,
      disableReason: row => getDeallocateDisableReason(row),
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
  loggedInUserId: string | undefined | null,
  can: AssetPermissionChecker
): IEnhancedTableConfig<IAssetGetResponseDto['records'][number]> {
  return {
    tableConfig: ASSET_TABLE_CONFIG,
    headers: ASSET_TABLE_HEADER_CONFIG,
    rowActions: buildAssetTableRowActionsConfig(loggedInUserId, can),
    bulkActions: ASSET_TABLE_BULK_ACTIONS_CONFIG,
  };
}
