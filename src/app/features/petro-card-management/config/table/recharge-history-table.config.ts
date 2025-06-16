import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const RECHARGE_HISTORY_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const RECHARGE_HISTORY_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Recharge',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Recharge',
    severity: ESeverity.DANGER,
  },
];

export const RECHARGE_HISTORY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'rechargeAmount',
    'rechargeMethod',
    'description',
    'status',
  ],
};

export const RECHARGE_HISTORY_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'rechargeAmount',
    header: 'Amount',
    bodyTemplate: ETableBodyTemplate.CURRENCY,
    filterConfig: {
      filterField: 'rechargeAmount',
      searchInputType: ETableSearchInputType.TEXT,
      placeholder: 'Search By Amount',
    },
  },
  {
    field: 'rechargeDate',
    header: 'Recharge Date',
    bodyTemplate: ETableBodyTemplate.DATE,
    filterConfig: {
      filterField: 'rechargeDate',
      searchInputType: ETableSearchInputType.TEXT,
      placeholder: 'Search By Date',
    },
  },
  {
    field: 'rechargeMethod',
    header: 'Payment Method',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'rechargeMethod',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Credit Card',
        'Bank Transfer',
        'Cash',
        'Check',
        'Online Transfer',
      ],
      placeholder: 'Search By Method',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'description',
    header: 'Description',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'description',
      placeholder: 'Search By Description',
    },
  },
  {
    field: 'referenceNumber',
    header: 'Reference Number',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'referenceNumber',
      placeholder: 'Search By Reference',
    },
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Completed',
        'Pending',
        'Failed',
        'Cancelled',
      ],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
]; 