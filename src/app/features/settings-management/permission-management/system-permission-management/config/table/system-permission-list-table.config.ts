import { MATCH_MODE_OPTIONS } from "../../../../../../shared/config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig, IEnhancedTableConfig } from "../../../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../../../shared/types";
import { ICONS } from "../../../../../../shared/constants";

export const SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.APPROVE,
    label: 'Activate',
    icon: ICONS.ACTIONS.CHECK,
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.REJECT,
    label: 'Deactivate',
    icon: ICONS.ACTIONS.TIMES,
    severity: ESeverity.WARNING,
  },
];

export const SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.APPROVE,
    icon: ICONS.ACTIONS.CHECK,
    tooltip: 'Activate Permission',
    severity: ESeverity.SUCCESS,
  },
  {
    id: ERowActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit Permission',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.REJECT,
    icon: ICONS.ACTIONS.TIMES,
    tooltip: 'Deactivate Permission',
    severity: ESeverity.WARNING,
  },
];

export const SYSTEM_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'label',
    'module',
    'description',
    'status',
  ],
  emptyMessage: 'No system permissions found.',
};

export const SYSTEM_PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
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
    showSort: true,
  },
  {
    field: 'module',
    header: 'Module',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'module',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Leave',
        'Attendance',
        'Employee',
        'Expense',
        'Asset',
        'Vehicle',
        'Site',
        'Settings'
      ],
      placeholder: 'Search By Module',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: true,
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Active',
        'Inactive'
      ],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: true,
  },
];

export const SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG : IEnhancedTableConfig = {
  tableConfig: SYSTEM_PERMISSION_LIST_TABLE_CONFIG,
  headers: SYSTEM_PERMISSION_LIST_TABLE_HEADER,
  bulkActions: SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG,
  rowActions: SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG,
}; 