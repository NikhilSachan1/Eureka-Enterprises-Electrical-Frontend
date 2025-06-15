import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const VEHICLE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.ALLOCATE,
    label: 'Allocate',
    icon: 'pi pi-user-plus',
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.DEALLOCATE,
    label: 'Deallocate',
    icon: 'pi pi-user-minus',
    severity: ESeverity.WARNING,
  },
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const VEHICLE_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Vehicle',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Vehicle',
    severity: ESeverity.DANGER,
  },
  {
    id: ERowActionType.ALLOCATE,
    icon: 'pi pi-user-plus',
    tooltip: 'Allocate Vehicle',
    severity: ESeverity.SUCCESS,
  },
  {
    id: ERowActionType.DEALLOCATE,
    icon: 'pi pi-user-minus',
    tooltip: 'Deallocate Vehicle',
    severity: ESeverity.WARNING,
  },
];

export const VEHICLE_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'brand',
    'model',
    'vehicleNumber',
    'allocationStatus',
    'allocatedTo',
    'petroCardNumber',
  ],
};

export const VEHICLE_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'brand',
    header: 'Brand & Model',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'model',
      primaryFieldLabel: 'Brand',
      secondaryFieldLabel: 'Model',
    },
    filterConfig: {
      filterField: 'brand',
      placeholder: 'Search Brand',
    },
  },
  {
    field: 'vehicleNumber',
    header: 'Vehicle Number',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'vehicleNumber',
      placeholder: 'Search Vehicle Number',
    },
  },
  {
    field: 'allocationStatus',
    header: 'Allocation Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'allocationStatus',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Allocated',
        'Available',
      ],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'allocatedTo',
    header: 'Allocated To',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'allocatedTo',
      placeholder: 'Search By Allocation',
    },
  },
  {
    field: 'petroCardNumber',
    header: 'Petro Card Number',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'petroCardNumber',
      placeholder: 'Search Petro Card',
    },
  },
  {
    field: 'vehicleDocuments',
    header: 'Vehicle Documents',
    bodyTemplate: ETableBodyTemplate.FILE_LINK,
    filterConfig: {
      filterField: 'vehicleDocuments',
      placeholder: 'Search Documents',
    },
  },
]; 