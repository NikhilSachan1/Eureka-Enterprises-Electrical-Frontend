import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/models';
import { ETableActionType, ETableBodyTemplate } from '@shared/types';
import { ICONS } from '@shared/constants';
import { IRoleGetBaseResponseDto } from '../../types/role.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';

export const ROLE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: ['label', 'description'],
  emptyMessage: 'No roles found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any roles yet. Please add a role first.",
};

export const ROLE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'label',
    header: 'Role Details',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'description' },
    primaryFieldHighlight: true,
    showImage: false,
    filterConfig: {
      filterField: 'label',
      placeholder: 'Search Role Name',
    },
  },
  {
    field: 'name',
    header: 'Role Code',
    showSort: false,
    showFilter: false,
  },
  {
    field: 'permissionCount',
    header: 'Permission Count',
    showSort: false,
    showFilter: false,
  },
];

export const ROLE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IRoleGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Role',
    disabledCondition: (selectedRows: IRoleGetBaseResponseDto[]): boolean => {
      return selectedRows.some(row => row.isEditable === false);
    },
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Role',
    disabledCondition: (selectedRows: IRoleGetBaseResponseDto[]): boolean => {
      return selectedRows.some(row => row.isDeletable === false);
    },
  },
  {
    id: ETableActionType.SET_PERMISSIONS,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Set Role Permissions',
  },
];

export const ROLE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IRoleGetBaseResponseDto>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete selected Role',
    disabledCondition: (selectedRows: IRoleGetBaseResponseDto[]): boolean => {
      return selectedRows.some(row => row.isDeletable === false);
    },
  },
];

export const ROLE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IRoleGetBaseResponseDto> =
  {
    tableConfig: ROLE_TABLE_CONFIG,
    headers: ROLE_TABLE_HEADER_CONFIG,
    rowActions: ROLE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: ROLE_TABLE_BULK_ACTIONS_CONFIG,
  };
