import { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const ASSET_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No asset record found.',
  showCheckbox: false,
};

export const ASSET_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Asset Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'assetId',
      showImage: false,
      dummyImageField: 'name',
      primaryFieldHighlight: true,
    },
    showSort: false,
  },
  {
    field: 'category',
    header: 'Asset Category',
    serverSideFilterAndSortConfig: {
      filterField: 'category',
    },
    showSort: false,
  },
  {
    field: 'calibrationFrom',
    header: 'Calibration From',
    showSort: false,
  },
  {
    field: 'calibrationStatus',
    header: 'Calibration Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'calibrationStatus',
    },
    showSort: false,
  },
  {
    field: 'warrantyStatus',
    header: 'Warranty Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'warrantyStatus',
    },
    showSort: false,
  },
  {
    field: 'status',
    header: 'Asset Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'status',
    },
    showSort: false,
  },
];

export const ASSET_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAssetGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Asset Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Asset',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Asset',
  },
];

export const ASSET_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IAssetGetResponseDto['records'][number]
> = {
  tableConfig: ASSET_TABLE_CONFIG,
  headers: ASSET_TABLE_HEADER_CONFIG,
  rowActions: ASSET_TABLE_ROW_ACTIONS_CONFIG,
};
