import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IVehicleGetResponseDto } from '../../types/vehicle.dto';

export const VEHICLE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vehicle record found.',
};

export const VEHICLE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'vehicleNumber',
    header: 'Vehicle Number',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'vehicleName',
      showImage: false,
      dummyImageField: 'vehicleName',
      primaryFieldHighlight: true,
    },
  },
  {
    field: 'petroCardNumber',
    header: 'Petro Card',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'petroCardName',
      showImage: false,
      dummyImageField: 'petroCardName',
      primaryFieldHighlight: true,
    },
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
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'vehicleAssigneeCode',
      showImage: true,
      dummyImageField: 'vehicleAssigneeName',
      primaryFieldHighlight: true,
    },
    serverSideFilterAndSortConfig: {
      filterField: 'vehicleAssignee',
    },
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
    field: 'fitnessStatus',
    header: 'Fitness Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'fitnessStatus',
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

export const VEHICLE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVehicleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Vehicle Details',
  },
  {
    id: EButtonActionType.EVENT_HISTORY,
    tooltip: 'View Event History',
  },
  {
    id: EButtonActionType.SERVICE_INFO,
    tooltip: 'View Service History',
  },
  {
    id: EButtonActionType.HANDOVER_INITIATE,
    tooltip: 'Allocate Vehicle',
  },
  {
    id: EButtonActionType.HANDOVER_ACCEPTED,
    tooltip: 'Accept Allocation',
  },
  {
    id: EButtonActionType.HANDOVER_REJECTED,
    tooltip: 'Reject Allocation',
  },
  {
    id: EButtonActionType.HANDOVER_CANCELLED,
    tooltip: 'Cancel Allocation',
  },
  {
    id: EButtonActionType.DEALLOCATE,
    tooltip: 'Deallocate Vehicle',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Vehicle',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Vehicle',
  },
];

export const VEHICLE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVehicleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Vehicle',
  },
];

export const VEHICLE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IVehicleGetResponseDto['records'][number]
> = {
  tableConfig: VEHICLE_TABLE_CONFIG,
  headers: VEHICLE_TABLE_HEADER_CONFIG,
  rowActions: VEHICLE_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: VEHICLE_TABLE_BULK_ACTIONS_CONFIG,
};
