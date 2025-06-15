import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const PETRO_CARD_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const PETRO_CARD_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Petro Card',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Petro Card',
    severity: ESeverity.DANGER,
  },
];

export const PETRO_CARD_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'cardName',
    'cardNumber',
    'holderName',
    'status',
  ],
};

export const PETRO_CARD_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'cardName',
    header: 'Petro Card Name',
    filterConfig: {
      filterField: 'cardName',
      placeholder: 'Search Card Name',
    },
  },
  {
    field: 'cardNumber',
    header: 'Card Number',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'cardNumber',
      placeholder: 'Search By Card Number',
    },
  },
  {
    field: 'expiryDate',
    header: 'Expiry Date',
    bodyTemplate: ETableBodyTemplate.DATE,
    filterConfig: {
      filterField: 'expiryDate',
      searchInputType: ETableSearchInputType.TEXT,
      placeholder: 'Search By Expiry Date',
    },
  },
  {
    field: 'holderName',
    header: 'Card Holder Name',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'holderName',
      placeholder: 'Search By Holder Name',
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
        'Active',
        'Expired',
        'Expiring Soon',
        'Blocked',
      ],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
]; 