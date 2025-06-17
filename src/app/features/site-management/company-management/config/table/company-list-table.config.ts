import { MATCH_MODE_OPTIONS } from "../../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../../shared/types";

export const COMPANY_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const COMPANY_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Company',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Company',
    severity: ESeverity.DANGER,
  },
];

export const COMPANY_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'companyName',
    'contactNumber',
    'emailAddress',
    'city',
    'state',
  ],
};

export const COMPANY_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'companyName',
    header: 'Company Name',
    filterConfig: {
      filterField: 'companyName',
      placeholder: 'Search Company Name',
    },
  },
  {
    field: 'contactNumber',
    header: 'Contact Number',
    filterConfig: {
      filterField: 'contactNumber',
      placeholder: 'Search Contact Number',
    },
  },
  {
    field: 'emailAddress',
    header: 'Email Address',
    filterConfig: {
      filterField: 'emailAddress',
      placeholder: 'Search Email Address',
    },
  },
  {
    field: 'city',
    header: 'City',
    filterConfig: {
      filterField: 'city',
      placeholder: 'Search City',
    },
  },
  {
    field: 'state',
    header: 'State',
    filterConfig: {
      filterField: 'state',
      placeholder: 'Search State',
    },
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: ['Active', 'Inactive'],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
  },
  }
]; 