import { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';

export const ASSET_EVENT_HISTORY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No asset event history record found.',
  showCheckbox: false,
};

export const ASSET_EVENT_HISTORY_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'eventDate',
      header: 'Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
    },
    {
      field: 'eventType',
      header: 'Event Type',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'fromUser',
      header: 'From User',
      showSort: false,
    },
    {
      field: 'toUser',
      header: 'To User',
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

export const ASSET_EVENT_HISTORY_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IAssetGetResponseDto['records'][number]
> = {
  tableConfig: ASSET_EVENT_HISTORY_TABLE_CONFIG,
  headers: ASSET_EVENT_HISTORY_TABLE_HEADER_CONFIG,
};
