import { MATCH_MODE_OPTIONS } from "../../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../../shared/types";

export const CONTRACTOR_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const CONTRACTOR_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Contractor',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Contractor',
    severity: ESeverity.DANGER,
  },
];

export const CONTRACTOR_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'contractorName',
    'contactNumber',
    'emailAddress',
    'gstNumber',
    'category',
  ],
};

export const CONTRACTOR_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'contractorName',
    header: 'Contractor Name',
    filterConfig: {
      filterField: 'contractorName',
      placeholder: 'Search Contractor Name',
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
    field: 'gstNumber',
    header: 'GST Number',
    filterConfig: {
      filterField: 'gstNumber',
      placeholder: 'Search GST Number',
    },
  },
  {
    field: 'category',
    header: 'Category',
    filterConfig: {
      filterField: 'category',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: ['Electrical', 'Civil', 'Mechanical', 'Plumbing', 'HVAC', 'Other'],
      placeholder: 'Search By Category',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
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