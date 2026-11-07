import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  ETableActionTypeValue,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IVehicleGetResponseDto } from '../../types/vehicle.dto';
import { ICONS } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

export const VEHICLE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vehicle record found.',
};

export const VEHICLE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'vehicleNumber',
    header: 'Vehicle Number',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'vehicleName' },
    icon: ICONS.COMMON.CAR,
    showImage: true,
    dummyImageField: 'vehicleName',
    primaryFieldHighlight: true,
  },
  {
    field: 'petroCardName',
    header: 'Petro Card',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'petroCardNumber' },
    showImage: true,
    icon: ICONS.COMMON.CREDIT_CARD,
    dummyImageField: 'petroCardName',
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'status',
    header: 'Vehicle Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'status',
    },
    showSort: false,
  },
  {
    field: 'vehicleAssigneeName',
    header: 'Assigned To',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'vehicleAssigneeCode' },
    showImage: true,
    dummyImageField: 'vehicleAssigneeName',
    primaryFieldHighlight: true,
    serverSideFilterAndSortConfig: {
      filterField: 'vehicleAssignee',
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
    field: 'vehicleDocuments',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
  {
    field: 'insuranceStatus',
    header: 'Insurance Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'insuranceStatus',
    },
    showSort: false,
  },
  {
    field: 'pucStatus',
    header: 'PUC Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'pucStatus',
    },
    showSort: false,
  },
  {
    field: 'serviceStatus',
    header: 'Service Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'serviceStatus',
    },
    showSort: false,
  },
  {
    field: 'serviceInfo',
    header: 'Service Info',
    customTemplateKey: 'serviceInfo',
    showSort: false,
  },
];

type VehicleTableRow = IVehicleGetResponseDto['records'][number];

/** Checks a permission of the logged-in user. The table config is plain data, so the component passes this in. */
export type VehiclePermissionChecker = (permission: string) => boolean;

/** Request types that are finished, so nothing is pending any more. */
const TERMINAL_REQUEST_EVENT_TYPES = new Set<string>([
  ETableActionTypeValue.HANDOVER_ACCEPTED,
  ETableActionTypeValue.HANDOVER_REJECTED,
  ETableActionTypeValue.HANDOVER_CANCELLED,
  ETableActionTypeValue.RETURN_ACCEPTED,
  ETableActionTypeValue.RETURN_REJECTED,
  ETableActionTypeValue.RETURN_CANCELLED,
]);

function isHandoverPending(row: VehicleTableRow): boolean {
  return (
    row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED
  );
}

/** The holder asked to return the vehicle to the office and nobody has answered yet. */
export function isVehicleReturnPending(row: VehicleTableRow): boolean {
  return row.latestEvent?.eventType === ETableActionTypeValue.RETURN_INITIATED;
}

/** Only one request at a time: a pending handover or return blocks every other change of holder. */
function hasPendingRequest(row: VehicleTableRow): boolean {
  return isHandoverPending(row) || isVehicleReturnPending(row);
}

function getHandoverInitiateDisableReason(
  row: VehicleTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  if (hasPendingRequest(row)) {
    return 'Request is already initiated.';
  }
  if (row.status === 'ASSIGNED') {
    if (!loggedInUserId || row.assignedTo !== loggedInUserId) {
      return 'Only the assigned user can initiate handover for this vehicle.';
    }
  }
  return undefined;
}

function getReturnToOfficeDisableReason(
  row: VehicleTableRow,
  loggedInUserId: string | null | undefined
): string | undefined {
  if (hasPendingRequest(row)) {
    return 'Request is already initiated.';
  }
  if (row.status !== 'ASSIGNED') {
    return 'Only an assigned vehicle can be returned to the office.';
  }
  if (!loggedInUserId || row.assignedTo !== loggedInUserId) {
    return 'Only the assigned user can return this vehicle to the office.';
  }
  return undefined;
}

/**
 * Accept and reject are the same buttons for both requests:
 * - Handover: only the target user, with the handover permission.
 * - Return to office: office staff with the return permission, but not the person returning it.
 */
function getRequestResponseDisableReason(
  row: VehicleTableRow,
  loggedInUserId: string | null | undefined,
  can: VehiclePermissionChecker,
  permissions: { handover: string; return: string }
): string | undefined {
  if (isVehicleReturnPending(row)) {
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
  row: VehicleTableRow,
  loggedInUserId: string | null | undefined,
  can: VehiclePermissionChecker
): string | undefined {
  if (!hasPendingRequest(row)) {
    const eventType = row.latestEvent?.eventType;
    return eventType && TERMINAL_REQUEST_EVENT_TYPES.has(eventType)
      ? 'This request has already been completed.'
      : 'No handover or return request is pending.';
  }
  const permission = isVehicleReturnPending(row)
    ? APP_PERMISSION.VEHICLE.RETURN_CANCELLED
    : APP_PERMISSION.VEHICLE.HANDOVER_CANCELLED;
  if (
    !can(permission) ||
    !loggedInUserId ||
    row.latestEvent?.fromUser !== loggedInUserId
  ) {
    return 'You are not authorized to cancel this request. Only the user who initiated the request can cancel.';
  }
  return undefined;
}

function getDeallocateDisableReason(row: VehicleTableRow): string | undefined {
  if (row.status !== 'ASSIGNED') {
    return 'Vehicle is not allocated.';
  }
  if (isVehicleReturnPending(row)) {
    return 'A return to office is pending. Accept, reject or cancel it first.';
  }
  return undefined;
}

export function buildVehicleTableRowActionsConfig(
  loggedInUserId: string | undefined | null,
  can: VehiclePermissionChecker
): Partial<ITableActionConfig<IVehicleGetResponseDto['records'][number]>>[] {
  return [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Vehicle Details',
      permission: [APP_PERMISSION.VEHICLE.VIEW_DETAIL],
    },
    {
      id: EButtonActionType.EVENT_HISTORY,
      tooltip: 'View Event History',
      permission: [APP_PERMISSION.VEHICLE.EVENT_HISTORY],
    },
    {
      id: EButtonActionType.SERVICE_INFO,
      tooltip: 'View Service History',
      permission: [APP_PERMISSION.VEHICLE.SERVICE_HISTORY],
    },
    {
      id: EButtonActionType.FUEL_REPORT,
      icon: ICONS.FUEL.MENU,
      tooltip: 'View Fuel Report',
      permission: [APP_PERMISSION.FUEL_EXPENSE.TABLE_VIEW],
    },
    {
      id: EButtonActionType.HANDOVER_INITIATE,
      tooltip: 'Handover Vehicle',
      permission: [APP_PERMISSION.VEHICLE.HANDOVER_INITIATE],
      disableWhen: row =>
        getHandoverInitiateDisableReason(row, loggedInUserId) !== undefined,
      disableReason: row =>
        getHandoverInitiateDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.RETURN_TO_OFFICE,
      tooltip: 'Return to Office',
      permission: [APP_PERMISSION.VEHICLE.RETURN_INITIATE],
      disableWhen: row =>
        getReturnToOfficeDisableReason(row, loggedInUserId) !== undefined,
      disableReason: row => getReturnToOfficeDisableReason(row, loggedInUserId),
    },
    {
      id: EButtonActionType.HANDOVER_ACCEPTED,
      tooltip: 'Accept Request',
      permission: [
        APP_PERMISSION.VEHICLE.HANDOVER_ACCEPTED,
        APP_PERMISSION.VEHICLE.RETURN_ACCEPTED,
      ],
      disableWhen: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.VEHICLE.HANDOVER_ACCEPTED,
          return: APP_PERMISSION.VEHICLE.RETURN_ACCEPTED,
        }) !== undefined,
      disableReason: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.VEHICLE.HANDOVER_ACCEPTED,
          return: APP_PERMISSION.VEHICLE.RETURN_ACCEPTED,
        }),
    },
    {
      id: EButtonActionType.HANDOVER_REJECTED,
      tooltip: 'Reject Request',
      permission: [
        APP_PERMISSION.VEHICLE.HANDOVER_REJECTED,
        APP_PERMISSION.VEHICLE.RETURN_REJECTED,
      ],
      disableWhen: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.VEHICLE.HANDOVER_REJECTED,
          return: APP_PERMISSION.VEHICLE.RETURN_REJECTED,
        }) !== undefined,
      disableReason: row =>
        getRequestResponseDisableReason(row, loggedInUserId, can, {
          handover: APP_PERMISSION.VEHICLE.HANDOVER_REJECTED,
          return: APP_PERMISSION.VEHICLE.RETURN_REJECTED,
        }),
    },
    {
      id: EButtonActionType.HANDOVER_CANCELLED,
      tooltip: 'Cancel Request',
      permission: [
        APP_PERMISSION.VEHICLE.HANDOVER_CANCELLED,
        APP_PERMISSION.VEHICLE.RETURN_CANCELLED,
      ],
      disableWhen: row =>
        getRequestCancelDisableReason(row, loggedInUserId, can) !== undefined,
      disableReason: row =>
        getRequestCancelDisableReason(row, loggedInUserId, can),
    },
    {
      id: EButtonActionType.DEALLOCATE,
      tooltip: 'Deallocate Vehicle',
      permission: [APP_PERMISSION.VEHICLE.DEALLOCATE],
      disableWhen: row => getDeallocateDisableReason(row) !== undefined,
      disableReason: row => getDeallocateDisableReason(row),
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit Vehicle',
      permission: [APP_PERMISSION.VEHICLE.EDIT],
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete Vehicle',
      permission: [APP_PERMISSION.VEHICLE.DELETE],
      disableWhen: row => row.status === 'ASSIGNED',
      disableReason: row =>
        row.status === 'ASSIGNED'
          ? 'First deallocate the vehicle from the assignee before deleting.'
          : undefined,
    },
    {
      id: EButtonActionType.LINK,
      tooltip: 'Link Petro Card',
      permission: [APP_PERMISSION.VEHICLE.LINK_PETRO_CARD],
      disableWhen: row => !!row.associatedCard,
      disableReason: () => 'Vehicle is already linked to a petro card',
    },
    {
      id: EButtonActionType.UNLINK,
      tooltip: 'Unlink Petro Card',
      permission: [APP_PERMISSION.VEHICLE.UNLINK_PETRO_CARD],
      disableWhen: row => !row.associatedCard,
      disableReason: () => 'Vehicle is not linked to a petro card',
    },
  ];
}

export const VEHICLE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVehicleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Vehicle',
    permission: [APP_PERMISSION.VEHICLE.DELETE],
    disableWhen: row => row.status === 'ASSIGNED',
    disableReason: row =>
      row.status === 'ASSIGNED'
        ? 'First deallocate the vehicle from the assignee before deleting.'
        : undefined,
  },
];

export function createVehicleTableEnhancedConfig(
  loggedInUserId: string | undefined | null,
  can: VehiclePermissionChecker
): IEnhancedTableConfig<IVehicleGetResponseDto['records'][number]> {
  return {
    tableConfig: VEHICLE_TABLE_CONFIG,
    headers: VEHICLE_TABLE_HEADER_CONFIG,
    rowActions: buildVehicleTableRowActionsConfig(loggedInUserId, can),
    bulkActions: VEHICLE_TABLE_BULK_ACTIONS_CONFIG,
  };
}
