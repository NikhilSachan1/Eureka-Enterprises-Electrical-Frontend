import { MATCH_MODE_OPTIONS } from "../../../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../../../shared/types";

export const SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.APPROVE,
    label: 'Activate',
    icon: 'pi pi-check',
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.REJECT,
    label: 'Deactivate',
    icon: 'pi pi-times',
    severity: ESeverity.WARNING,
  },
];

export const SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.APPROVE,
    icon: 'pi pi-check',
    tooltip: 'Activate Permission',
    severity: ESeverity.SUCCESS,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Permission',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.REJECT,
    icon: 'pi pi-times',
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