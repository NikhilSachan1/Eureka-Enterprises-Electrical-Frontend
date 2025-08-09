import { MATCH_MODE_OPTIONS, MODULES_NAME_DATA } from '@shared/config';
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
  EButtonSeverity,
  ETableActionType,
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
      bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
      textWithSubtitleAndImageConfig: {
        secondaryField: 'description',
        primaryFieldHighlight: true,
        showImage: false,
      },
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
    id: ETableActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit Permission',
    severity: EButtonSeverity.WARNING,
    disabledCondition: (
      selectedRows: ISystemPermissionGetBaseResponseDto[]
    ): boolean => {
      return selectedRows.some(row => row.isEditable === false);
    },
  },
  {
    id: ETableActionType.DELETE,
    icon: ICONS.ACTIONS.TRASH,
    tooltip: 'Delete Permission',
    severity: EButtonSeverity.DANGER,
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
    id: ETableActionType.DELETE,
    label: 'Delete',
    icon: ICONS.ACTIONS.TRASH,
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
