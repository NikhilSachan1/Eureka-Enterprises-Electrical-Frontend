import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ISystemPermissionGetResponseDto } from '../../types/system-permission.dto';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const SYSTEM_PERMISSION_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No system permissions found.',
};

export const SYSTEM_PERMISSION_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'permissionLabel',
      header: 'Permission Detail',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'permissionDescription' },
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'moduleName',
      header: 'Module Name',
      bodyTemplate: EDataType.TEXT,
      showSort: true,
    },
    {
      field: 'permissionCode',
      header: 'Permission Code',
      showSort: false,
    },
  ];

export const SYSTEM_PERMISSION_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ISystemPermissionGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Permission',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Permission',
  },
];

export const SYSTEM_PERMISSION_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ISystemPermissionGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete selected Permission',
  },
];

export const SYSTEM_PERMISSION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  ISystemPermissionGetResponseDto['records'][number]
> = {
  tableConfig: SYSTEM_PERMISSION_TABLE_CONFIG,
  headers: SYSTEM_PERMISSION_TABLE_HEADER_CONFIG,
  rowActions: SYSTEM_PERMISSION_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: SYSTEM_PERMISSION_TABLE_BULK_ACTIONS_CONFIG,
};
