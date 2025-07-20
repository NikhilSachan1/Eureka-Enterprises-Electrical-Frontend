import { MATCH_MODE_OPTIONS, MODULES_NAME_DATA } from '@shared/config';
import {
  IBulkActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  IRowActionConfig,
} from '@shared/models';
import {
  ERowActionType,
  ETableBodyTemplate,
  ETableFilterMatchMode,
  ETableSearchInputType,
  EButtonSeverity,
  EBulkActionType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { getDataFromArrayOfObjects } from '@shared/utility';
import { IGetSingleSystemPermissionListResponseDto } from '@features/settings-management/permission-management/system-permission-management/models/system-permission.api.model';

export const SYSTEM_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: ['label', 'module', 'description'],
  emptyMessage: 'No system permissions found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any system permissions yet. Please set up system permissions.",
};

export const SYSTEM_PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] =
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

export const SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<
  IRowActionConfig<IGetSingleSystemPermissionListResponseDto>
>[] = [
  {
    id: ERowActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit Permission',
    severity: EButtonSeverity.WARNING,
    disabledCondition: (rowData: IGetSingleSystemPermissionListResponseDto) =>
      rowData.isEditable === false,
  },
  {
    id: ERowActionType.DELETE,
    icon: ICONS.ACTIONS.TRASH,
    tooltip: 'Delete Permission',
    severity: EButtonSeverity.DANGER,
    disabledCondition: (rowData: IGetSingleSystemPermissionListResponseDto) =>
      rowData.isDeletable === false,
  },
];

export const SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<
  IBulkActionConfig<IGetSingleSystemPermissionListResponseDto>
>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: ICONS.ACTIONS.TRASH,
    disabledCondition: (
      selectedRows: IGetSingleSystemPermissionListResponseDto[]
    ): boolean => {
      return selectedRows.some(row => row.isDeletable === false);
    },
  },
];

export const SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG: IEnhancedTableConfig<IGetSingleSystemPermissionListResponseDto> =
  {
    tableConfig: SYSTEM_PERMISSION_LIST_TABLE_CONFIG,
    headers: SYSTEM_PERMISSION_LIST_TABLE_HEADER,
    rowActions: SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG,
    bulkActions: SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG,
  };
