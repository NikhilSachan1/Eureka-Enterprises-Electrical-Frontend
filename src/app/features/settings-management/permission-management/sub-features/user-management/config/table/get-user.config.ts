import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  ITableActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  EButtonActionType,
  EDataType,
} from '@shared/types';
import { IUserGetResponseDto } from '../../types/user.dto';

export const USER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No users found.',
};

export const USER_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'employeeCode' },
    primaryFieldHighlight: true,
    showImage: true,
    dummyImageField: 'employeeName',
  },
  {
    field: 'employeeRole',
    header: 'Employee Role',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'userPermissionCount',
    header: 'Permission Count',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'permissionCountUser',
    showSort: false,
  },
];

export const USER_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IUserGetResponseDto['records'][number]>
>[] = [
  {
    id: EButtonActionType.SET_PERMISSIONS,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Set User Permissions',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete User Permissions',
  },
  {
    id: EButtonActionType.CHANGE_USER_ROLE,
    tooltip: 'Change User Role',
  },
];

export const USER_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IUserGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Users Permissions',
  },
];

export const USER_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IUserGetResponseDto['records'][number]
> = {
  tableConfig: USER_TABLE_CONFIG,
  headers: USER_TABLE_HEADER_CONFIG,
  rowActions: USER_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: USER_TABLE_BULK_ACTIONS_CONFIG,
};
