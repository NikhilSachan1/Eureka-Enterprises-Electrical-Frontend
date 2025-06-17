import { MATCH_MODE_OPTIONS } from "../../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../../shared/types";

export const PROJECT_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const PROJECT_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Project',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Project',
    severity: ESeverity.DANGER,
  },
];

export const PROJECT_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'projectName',
    'workOn',
    'projectStatus',
  ],
};

export const PROJECT_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'projectName',
    header: 'Project Name',
    filterConfig: {
      filterField: 'projectName',
      placeholder: 'Search Project Name',
    },
  },
  {
    field: 'fromDate',
    header: 'From - To Date',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    dataType: ETableDataType.DATE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'toDate',
      primaryFieldLabel: 'From',
      secondaryFieldLabel: 'To',
      dataType: ETableDataType.DATE,
    },
  },
  {
    field: 'workOn',
    header: 'Work ON',
    bodyTemplate: ETableBodyTemplate.BULLET_POINTS,
    filterConfig: {
      filterField: 'workOn',
      placeholder: 'Search Work ON',
    },
  },
  {
    field: 'projectStatus',
    header: 'Project Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'projectStatus',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: ['Active', 'Completed', 'On Hold', 'Cancelled'],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
]; 