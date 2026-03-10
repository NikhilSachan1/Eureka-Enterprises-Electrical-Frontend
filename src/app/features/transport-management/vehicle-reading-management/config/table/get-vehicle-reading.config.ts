import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IVehicleReadingGetResponseDto } from '../../types/vehicle-reading.dto';

export const VEHICLE_READING_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vehicle reading record found.',
};

export const VEHICLE_READING_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'vehicle.registrationNo',
      header: 'Vehicle',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'vehicle.brandModel' },
      icon: ICONS.COMMON.CAR,
      showImage: true,
      dummyImageField: 'vehicle.registrationNo',
      primaryFieldHighlight: true,
    },
    {
      field: 'driver.fullName',
      header: 'Driver',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'driver.employeeId' },
      icon: ICONS.COMMON.USER,
      showImage: true,
      dummyImageField: 'driver.fullName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'site.name',
      header: 'Site',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'site.location' },
      icon: ICONS.COMMON.MAP_MARKER,
      showImage: true,
      primaryFieldHighlight: true,
      dummyImageField: 'site.name',
      showSort: false,
    },
    {
      field: 'readingDate',
      header: 'Reading Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      serverSideFilterAndSortConfig: {
        sortField: 'readingDate',
        filterField: 'readingDate',
      },
    },
    {
      field: 'totalKmTraveled',
      header: 'KM Traveled',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: {
        field: 'meterReading',
        bodyTemplate: EDataType.RANGE,
        dataType: EDataType.NUMBER,
      },
      primaryFieldHighlight: true,
      showSort: false,
      suffix: 'KM',
    },
    {
      field: 'driverRemarks',
      header: 'Remarks',
      bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
      showSort: false,
    },
    {
      field: 'documentKeys',
      header: 'Attachments',
      bodyTemplate: EDataType.ATTACHMENTS,
      showSort: false,
    },
    {
      field: 'anomalyStatus',
      header: 'Anomaly Status',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'anomalyReason',
      header: 'Anomaly Reason',
      bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
      showSort: false,
    },
  ];

export const VEHICLE_READING_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVehicleReadingGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Vehicle Reading Details',
    permission: [APP_PERMISSION.VEHICLE_READING.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Vehicle Reading',
    permission: [APP_PERMISSION.VEHICLE_READING.EDIT],
  },
];

export const VEHICLE_READING_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IVehicleReadingGetResponseDto['records'][number]
> = {
  tableConfig: VEHICLE_READING_TABLE_CONFIG,
  headers: VEHICLE_READING_TABLE_HEADER_CONFIG,
  rowActions: VEHICLE_READING_TABLE_ROW_ACTIONS_CONFIG,
};
