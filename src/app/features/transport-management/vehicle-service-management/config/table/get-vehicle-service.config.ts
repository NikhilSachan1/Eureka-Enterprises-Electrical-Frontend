import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IVehicleServiceGetResponseDto } from '../../types/vehicle-service.dto';
import { ICONS } from '@shared/constants';
export const VEHICLE_SERVICE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vehicle service record found.',
};

export const VEHICLE_SERVICE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'vehicle.registrationNo',
      header: 'Vehicle Number',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'vehicleName' },
      showImage: true,
      icon: ICONS.COMMON.CAR,
      dummyImageField: 'vehicleName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'serviceDate',
      header: 'Service Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      serverSideFilterAndSortConfig: {
        sortField: 'serviceDate',
        filterField: 'serviceDate',
      },
    },
    {
      field: 'odometerReading',
      header: 'Odometer Reading',
      bodyTemplate: EDataType.NUMBER,
      dataType: EDataType.NUMBER,
      showSort: false,
    },
    {
      field: 'serviceType',
      header: 'Service Type',
      bodyTemplate: EDataType.TEXT,
      serverSideFilterAndSortConfig: {
        filterField: 'serviceType',
      },
      showSort: false,
    },
    {
      field: 'serviceCost',
      header: 'Service Cost',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.NUMBER,
      showSort: false,
    },
    {
      field: 'remarks',
      header: 'Remarks',
      bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
      showSort: false,
    },
    {
      field: 'serviceFiles',
      header: 'Attachments',
      bodyTemplate: EDataType.ATTACHMENTS,
      showSort: false,
    },
  ];

export const VEHICLE_SERVICE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVehicleServiceGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Vehicle Service Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Vehicle Service',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Vehicle Service',
  },
];

export const VEHICLE_SERVICE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVehicleServiceGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Vehicle Service',
  },
];

export const VEHICLE_SERVICE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IVehicleServiceGetResponseDto['records'][number]
> = {
  tableConfig: VEHICLE_SERVICE_TABLE_CONFIG,
  headers: VEHICLE_SERVICE_TABLE_HEADER_CONFIG,
  rowActions: VEHICLE_SERVICE_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: VEHICLE_SERVICE_TABLE_BULK_ACTIONS_CONFIG,
};
