import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";
import { ICONS } from "../../../../shared/constants";

export const PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: ICONS.ACTIONS.TRASH,
    severity: ESeverity.DANGER,
  },
];

export const PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: ICONS.ACTIONS.EYE,
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit Permission',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: ICONS.ACTIONS.TRASH,
    tooltip: 'Delete Permission',
    severity: ESeverity.DANGER,
  },
];

export const PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'name',
    'description',
    'moduleName',
  ],
};

export const PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Permission Name',
    showFilter: true,
    showSort: true,
    filterConfig: {
      filterField: 'name',
      placeholder: 'Search Permission Name',
    },
  },
  {
    field: 'description',
    header: 'Description',
    showFilter: true,
    showSort: true,
    filterConfig: {
      filterField: 'description',
      placeholder: 'Search Description',
    },
  },
  {
    field: 'moduleName',
    header: 'Module',
    showFilter: true,
    showSort: true,
    filterConfig: {
      filterField: 'moduleName',
      placeholder: 'Search Module',
    },
  },
  {
    field: 'createdAt',
    header: 'Created Date',
    bodyTemplate: ETableBodyTemplate.TEXT,
    dataType: 'date' as any,
    dateFormat: 'dd-MM-yyyy',
    showFilter: true,
    showSort: true,
    filterConfig: {
      filterField: 'createdAt',
      searchInputType: ETableSearchInputType.TEXT,
      placeholder: 'Search Date',
    },
  },
]; 