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

export function buildVehicleTableRowActionsConfig(
  loggedInUserId: string | undefined | null
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
      id: EButtonActionType.HANDOVER_INITIATE,
      tooltip: 'Handover Vehicle',
      permission: [APP_PERMISSION.VEHICLE.HANDOVER_INITIATE],
      disableWhen: row =>
        row.latestEvent?.eventType === ETableActionTypeValue.HANDOVER_INITIATED,
    },
    {
      id: EButtonActionType.HANDOVER_ACCEPTED,
      tooltip: 'Accept Allocation',
      permission: [APP_PERMISSION.VEHICLE.HANDOVER_ACCEPTED],
      disableWhen: row =>
        row.latestEvent?.eventType !==
          ETableActionTypeValue.HANDOVER_INITIATED ||
        !loggedInUserId ||
        row.latestEvent.toUser !== loggedInUserId,
    },
    {
      id: EButtonActionType.HANDOVER_REJECTED,
      tooltip: 'Reject Allocation',
      permission: [APP_PERMISSION.VEHICLE.HANDOVER_REJECTED],
      disableWhen: row =>
        row.latestEvent?.eventType !==
          ETableActionTypeValue.HANDOVER_INITIATED ||
        !loggedInUserId ||
        row.latestEvent.toUser !== loggedInUserId,
    },
    {
      id: EButtonActionType.HANDOVER_CANCELLED,
      tooltip: 'Cancel Allocation',
      permission: [APP_PERMISSION.VEHICLE.HANDOVER_CANCELLED],
      disableWhen: row =>
        row.latestEvent?.eventType !==
          ETableActionTypeValue.HANDOVER_INITIATED ||
        !loggedInUserId ||
        row.latestEvent.fromUser !== loggedInUserId,
    },
    {
      id: EButtonActionType.DEALLOCATE,
      tooltip: 'Deallocate Vehicle',
      permission: [APP_PERMISSION.VEHICLE.DEALLOCATE],
      disableWhen: row => row.status !== 'ASSIGNED',
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
    },
    {
      id: EButtonActionType.LINK,
      tooltip: 'Link Petro Card',
      permission: [APP_PERMISSION.VEHICLE.LINK_PETRO_CARD],
      disableWhen: row => !!row.associatedCard,
    },
    {
      id: EButtonActionType.UNLINK,
      tooltip: 'Unlink Petro Card',
      permission: [APP_PERMISSION.VEHICLE.UNLINK_PETRO_CARD],
      disableWhen: row => !row.associatedCard,
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
  },
];

export function createVehicleTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IVehicleGetResponseDto['records'][number]> {
  return {
    tableConfig: VEHICLE_TABLE_CONFIG,
    headers: VEHICLE_TABLE_HEADER_CONFIG,
    rowActions: buildVehicleTableRowActionsConfig(loggedInUserId),
    bulkActions: VEHICLE_TABLE_BULK_ACTIONS_CONFIG,
  };
}
