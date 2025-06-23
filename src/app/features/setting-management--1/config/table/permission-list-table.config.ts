import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Permission',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
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