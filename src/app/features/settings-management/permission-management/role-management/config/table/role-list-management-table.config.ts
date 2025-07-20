import {
  IRowActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  IBulkActionConfig,
} from '@shared/models';
import {
  ERowActionType,
  ETableBodyTemplate,
  EButtonSeverity,
  EBulkActionType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { IGetSingleRoleListResponseDto } from '@features/settings-management/permission-management/role-management/models/role-management.api.model';

export const ROLE_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: ['label', 'description'],
  emptyMessage: 'No roles found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription: "You don't have any roles yet. Please set up roles.",
};

export const ROLE_PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'label',
      header: 'Role Details',
      bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
      textWithSubtitleAndImageConfig: {
        secondaryField: 'description',
        primaryFieldHighlight: true,
        showImage: false,
      },
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

export const ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] =
  [
    {
      id: ERowActionType.EDIT,
      icon: ICONS.ACTIONS.EDIT,
      tooltip: 'Edit Role',
      severity: EButtonSeverity.WARNING,
      disabledCondition: (rowData: Record<string, unknown>) =>
        (rowData as IGetSingleRoleListResponseDto).isEditable === false,
    },
    {
      id: ERowActionType.DELETE,
      icon: ICONS.ACTIONS.TRASH,
      tooltip: 'Delete Role',
      severity: EButtonSeverity.DANGER,
      disabledCondition: (rowData: Record<string, unknown>) =>
        (rowData as IGetSingleRoleListResponseDto).isDeletable === false,
    },
    {
      id: ERowActionType.EDIT_PERMISSIONS,
      icon: ICONS.SETTINGS.COG,
      tooltip: 'Edit Role Permissions',
      severity: EButtonSeverity.INFO,
    },
  ];

export const ROLE_PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] =
  [
    {
      id: EBulkActionType.DELETE,
      label: 'Delete',
      icon: ICONS.ACTIONS.TRASH,
      disabledCondition: (selectedRows: Record<string, unknown>[]): boolean => {
        return (selectedRows as IGetSingleRoleListResponseDto[]).some(
          row => row.isDeletable === false
        );
      },
    },
  ];

export const ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG: IEnhancedTableConfig =
  {
    tableConfig: ROLE_PERMISSION_LIST_TABLE_CONFIG,
    headers: ROLE_PERMISSION_LIST_TABLE_HEADER,
    rowActions: ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG,
    bulkActions: ROLE_PERMISSION_LIST_BULK_ACTIONS_CONFIG,
  };
