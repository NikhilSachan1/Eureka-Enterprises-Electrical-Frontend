import {
  COMMON_BULK_ACTIONS,
  COMMON_ROW_ACTIONS,
  MATCH_MODE_OPTIONS,
  MODULES_NAME_DATA,
} from '@shared/config';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/models';
import {
  ETableBodyTemplate,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { getDataFromArrayOfObjects } from '@shared/utility';
import { ISystemPermissionGetBaseResponseDto } from '../../types/system-permission.dto';

export const SYSTEM_PERMISSION_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: ['label', 'module', 'description'],
  emptyMessage: 'No system permissions found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any system permissions yet. Please set up system permissions.",
};

export const SYSTEM_PERMISSION_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'label',
      header: 'Permission Details',
      bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'description' },
      primaryFieldHighlight: true,
      showImage: false,
      filterConfig: {
        filterField: 'label',
        placeholder: 'Search Permission Name',
      },
    },
    {
      field: 'module',
      header: 'Module',
      bodyTemplate: ETableBodyTemplate.TEXT,
      filterConfig: {
        filterField: 'module',
        searchInputType: ETableSearchInputType.DROPDOWN,
        filterDropdownOptions: getDataFromArrayOfObjects(
          MODULES_NAME_DATA,
          'label'
        ),
        placeholder: 'Search By Module',
        matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
        defaultMatchMode: ETableFilterMatchMode.EQUALS,
      },
      showSort: true,
    },
    {
      field: 'name',
      header: 'Permission Code',
      showSort: false,
      showFilter: false,
    },
  ];

export const SYSTEM_PERMISSION_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ISystemPermissionGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Permission',
    disabledCondition: (
      selectedRows: ISystemPermissionGetBaseResponseDto[]
    ): boolean => {
      return selectedRows.some(row => row.isEditable === false);
    },
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Permission',
    disabledCondition: (
      selectedRows: ISystemPermissionGetBaseResponseDto[]
    ): boolean => {
      return selectedRows.some(row => row.isDeletable === false);
    },
  },
];

export const SYSTEM_PERMISSION_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ISystemPermissionGetBaseResponseDto>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete selected Permission',
    disabledCondition: (
      selectedRows: ISystemPermissionGetBaseResponseDto[]
    ): boolean => {
      return selectedRows.some(row => row.isDeletable === false);
    },
  },
];

export const SYSTEM_PERMISSION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<ISystemPermissionGetBaseResponseDto> =
  {
    tableConfig: SYSTEM_PERMISSION_TABLE_CONFIG,
    headers: SYSTEM_PERMISSION_TABLE_HEADER_CONFIG,
    rowActions: SYSTEM_PERMISSION_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: SYSTEM_PERMISSION_TABLE_BULK_ACTIONS_CONFIG,
  };
