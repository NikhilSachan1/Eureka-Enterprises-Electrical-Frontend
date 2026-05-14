import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IVendorGetResponseDto } from '../../types/vendor.dto';
// import { APP_PERMISSION } from '@core/constants/app-permission.constant';

const VENDOR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vendor record found.',
};

const VENDOR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Vendor Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'name',
    primaryFieldHighlight: true,
  },
  {
    field: 'vendorType',
    header: 'Vendor Type',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'gstNumber',
    header: 'GST Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'status',
    header: 'Vendor Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'vendorStatus',
    },
    showSort: false,
  },
  {
    field: 'stateCity',
    header: 'Location',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'pincode' },
    serverSideFilterAndSortConfig: {
      filterField: 'location',
    },
    showSort: false,
  },
  {
    field: 'email',
    header: 'Contact',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'contactNumber' },
    showSort: false,
  },
];

const VENDOR_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVendorGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Vendor Details',
    // permission: [APP_PERMISSION.VENDOR.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Vendor',
    // permission: [APP_PERMISSION.VENDOR.EDIT],
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Vendor Status',
    // permission: [APP_PERMISSION.VENDOR.CHANGE_STATUS],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Vendor',
    // permission: [APP_PERMISSION.VENDOR.DELETE],
  },
];

const VENDOR_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IVendorGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Vendor',
    // permission: [APP_PERMISSION.VENDOR.DELETE],
  },
];

export const VENDOR_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IVendorGetResponseDto['records'][number]
> = {
  tableConfig: VENDOR_TABLE_CONFIG,
  headers: VENDOR_TABLE_HEADER_CONFIG,
  rowActions: VENDOR_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: VENDOR_TABLE_BULK_ACTIONS_CONFIG,
};
