import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const LEAVE_REQUESTS_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.APPROVE,
    label: 'Approve',
    icon: 'pi pi-check',
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.REJECT,
    label: 'Reject',
    icon: 'pi pi-times',
    severity: ESeverity.DANGER,
  },
  {
    id: EBulkActionType.CANCEL,
    label: 'Cancel',
    icon: 'pi pi-ban',
    severity: ESeverity.WARNING,
  }
];

export const LEAVE_REQUESTS_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.APPROVE,
    icon: 'pi pi-check',
    tooltip: 'Approve Leave',
    severity: ESeverity.SUCCESS,
  },
  {
    id: ERowActionType.REJECT,
    icon: 'pi pi-times',
    tooltip: 'Reject Leave',
    severity: ESeverity.DANGER,
  },
  {
    id: ERowActionType.CANCEL,
    icon: 'pi pi-ban',
    tooltip: 'Cancel Leave',
    severity: ESeverity.WARNING,
  }
];

export const LEAVE_REQUESTS_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'name',
    'employeeId',
    'fromDate',
    'toDate',
    'duration',
    'comment',
    'approvalStatus',
  ],
};

export const LEAVE_REQUESTS_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Employee Name',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'employeeId',
      showImage: true,
      dummyImageField: 'name',
      primaryFieldHighlight: true,
    },
    filterConfig: {
      filterField: 'name',
      placeholder: 'Search Employee Name',
    },
  },
  {
    field: 'fromDate',
    header: 'Leave Period',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    dataType: ETableDataType.DATE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'toDate',
      primaryFieldLabel: 'From',
      secondaryFieldLabel: 'To',
      dataType: ETableDataType.DATE,
    },
    showFilter: false,
    showSort: false,
    filterConfig: {
      filterField: 'fromDate',
      placeholder: 'Search By Leave Period',
      matchModeOptions: MATCH_MODE_OPTIONS.date,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'duration',
    header: 'Duration',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'duration',
      placeholder: 'Search By Duration',
    },
    showFilter: false,
    showSort: false,
  },
  {
    field: 'comment',
    header: 'Comment',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'comment',
      placeholder: 'Search By Comment',
    },
    showFilter: false,
    showSort: false,
  },
  {
    field: 'approvalStatus',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'approvalStatus',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: ['Pending', 'Approved', 'Rejected', 'Canceled'],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
]; 