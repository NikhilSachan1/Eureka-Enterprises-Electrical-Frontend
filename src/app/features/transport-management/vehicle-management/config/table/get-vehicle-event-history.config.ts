import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IVehicleGetResponseDto } from '../../types/vehicle.dto';

export const VEHICLE_EVENT_HISTORY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vehicle event history record found.',
  showCheckbox: false,
};

export const VEHICLE_EVENT_HISTORY_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'eventDate',
      header: 'Date & Time',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME,
      serverSideFilterAndSortConfig: {
        sortField: 'createdAt',
        filterField: 'eventDate', // Required for date range filter to be sent in API payload
      },
    },
    {
      field: 'eventType',
      header: 'Action',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'fromUserName',
      header: 'Previous Holder',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'fromUserCode' },
      showImage: true,
      dummyImageField: 'fromUserName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'toUserName',
      header: 'New Holder',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'toUserCode' },
      showImage: true,
      dummyImageField: 'toUserName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'createdByName',
      header: 'Action Performed By',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'createdByCode' },
      showImage: true,
      dummyImageField: 'createdByName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'remarks',
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
  ];

export const VEHICLE_EVENT_HISTORY_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IVehicleGetResponseDto['records'][number]
> = {
  tableConfig: VEHICLE_EVENT_HISTORY_TABLE_CONFIG,
  headers: VEHICLE_EVENT_HISTORY_TABLE_HEADER_CONFIG,
};
