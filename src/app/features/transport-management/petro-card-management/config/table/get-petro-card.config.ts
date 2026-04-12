import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IPetroCardGetResponseDto } from '../../types/petro-card.dto';
import { ICONS } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

export const PETRO_CARD_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No petro card record found.',
};

export const PETRO_CARD_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'cardName',
      header: 'Card Name',
      icon: ICONS.COMMON.CREDIT_CARD,
      showImage: true,
      dummyImageField: 'cardName',
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
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'vehicleName' },
      dummyImageField: 'vehicleName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'addedBy',
      header: 'Added By',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'employeeId' },
      showImage: true,
      dummyImageField: 'addedBy',
      primaryFieldHighlight: true,
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
    permission: [APP_PERMISSION.PETRO_CARD.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Petro Card',
    permission: [APP_PERMISSION.PETRO_CARD.DELETE],
    disableWhen: row => row.isAllocated,
    disableReason: row =>
      row.isAllocated
        ? 'First unlink the petro card from the vehicle before deleting.'
        : undefined,
  },
  {
    id: EButtonActionType.LINK,
    tooltip: 'Link to Vehicle',
    permission: [APP_PERMISSION.PETRO_CARD.LINK_VEHICLE],
    disableWhen: row => !!row.isAllocated,
    disableReason: () => 'Petro card is already linked to a vehicle',
  },
  {
    id: EButtonActionType.UNLINK,
    tooltip: 'Unlink from Vehicle',
    permission: [APP_PERMISSION.PETRO_CARD.UNLINK_VEHICLE],
    disableWhen: row => !row.isAllocated,
    disableReason: () => 'Petro card is not linked to a vehicle',
  },
];

export const PETRO_CARD_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPetroCardGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Petro Card',
    permission: [APP_PERMISSION.PETRO_CARD.DELETE],
    disableWhen: row => row.isAllocated,
    disableReason: row =>
      row.isAllocated
        ? 'First unlink the petro card from the vehicle before deleting.'
        : undefined,
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
