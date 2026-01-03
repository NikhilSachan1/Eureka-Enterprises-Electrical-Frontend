import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IPetroCardGetResponseDto } from '../../types/petro-card.dto';

export const PETRO_CARD_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No petro card record found.',
};

export const PETRO_CARD_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'cardName',
      header: 'Card Name',
      showSort: false,
    },
    {
      field: 'cardNumber',
      header: 'Card Number',
      showSort: false,
    },
    {
      field: 'status',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      serverSideFilterAndSortConfig: {
        filterField: 'status',
      },
      showSort: false,
    },
    {
      field: 'vehicleNumber',
      header: 'Allocated To',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
      textWithSubtitleAndImageConfig: {
        secondaryField: 'vehicleName',
        dummyImageField: 'vehicleName',
        primaryFieldHighlight: true,
      },
      showSort: false,
    },
    {
      field: 'addedBy',
      header: 'Added By',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
      textWithSubtitleAndImageConfig: {
        secondaryField: 'employeeId',
        showImage: true,
        dummyImageField: 'addedBy',
        primaryFieldHighlight: true,
      },
      showSort: false,
    },
    {
      field: 'addedAt',
      header: 'Added On',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
  ];

export const PETRO_CARD_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPetroCardGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Petro Card',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Petro Card',
  },
];

export const PETRO_CARD_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPetroCardGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Petro Card',
  },
];

export const PETRO_CARD_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IPetroCardGetResponseDto['records'][number]
> = {
  tableConfig: PETRO_CARD_TABLE_CONFIG,
  headers: PETRO_CARD_TABLE_HEADER_CONFIG,
  rowActions: PETRO_CARD_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: PETRO_CARD_TABLE_BULK_ACTIONS_CONFIG,
};
