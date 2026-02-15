import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { IRoleGetResponseDto } from '../../types/role.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';

export const ROLE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No roles found.',
};

export const ROLE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'roleLabel',
    header: 'Role Detail',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'roleDescription' },
    primaryFieldHighlight: true,
  },
  {
    field: 'roleCode',
    header: 'Role Code',
    bodyTemplate: EDataType.TEXT,
  },
  {
    field: 'rolePermissionCount',
    header: 'Permission Count',
    bodyTemplate: EDataType.TEXT,
  },
];

export const ROLE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IRoleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Role',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Role',
  },
  {
    id: EButtonActionType.SET_PERMISSIONS,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Set Role Permissions',
  },
];

export const ROLE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IRoleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete selected Role',
  },
];

export const ROLE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IRoleGetResponseDto['records'][number]
> = {
  tableConfig: ROLE_TABLE_CONFIG,
  headers: ROLE_TABLE_HEADER_CONFIG,
  rowActions: ROLE_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: ROLE_TABLE_BULK_ACTIONS_CONFIG,
};
