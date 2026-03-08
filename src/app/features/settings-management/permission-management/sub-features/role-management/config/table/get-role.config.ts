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
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

export const ROLE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No roles found.',
};

export const ROLE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'roleLabel',
    header: 'Role Detail',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: {
      field: 'roleDescription',
      bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    },
    primaryFieldHighlight: true,
    icon: ICONS.SETTINGS.COG,
    showImage: true,
    dummyImageField: 'roleLabel',
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
    customTemplateKey: 'permissionCountRole',
  },
];

export const ROLE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IRoleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Role',
    permission: [APP_PERMISSION.ROLE_PERMISSION.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Role',
    permission: [APP_PERMISSION.ROLE_PERMISSION.DELETE],
  },
  {
    id: EButtonActionType.SET_PERMISSIONS,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Set Role Permissions',
    permission: [APP_PERMISSION.ROLE_PERMISSION.SET],
  },
];

export const ROLE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IRoleGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete selected Role',
    permission: [APP_PERMISSION.ROLE_PERMISSION.DELETE],
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
