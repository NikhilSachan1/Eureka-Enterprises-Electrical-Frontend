import {
  IBulkActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IRowActionConfig,
} from '../../../shared/models/data-table-config.model';
import { MATCH_MODE_OPTIONS } from '../../../shared/config/data-table.config';
import {
  EBulkActionType,
  ERowActionType,
  ESeverity,
  ETableBodyTemplate,
  ETableDataType,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '../../../shared/types';

export const EMPLOYEE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.SET_INACTIVE,
    label: 'Set In-active',
    icon: 'pi pi-user-minus',
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.DELETE,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: ESeverity.DANGER,
  },
];

export const EMPLOYEE_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Profile',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-pencil',
    tooltip: 'Edit Employee',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Employee',
    severity: ESeverity.DANGER,
  },
];

export const EMPLOYEE_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: ['name', 'role', 'email', 'status'],
};

export const EMPLOYEE_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
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
    field: 'role',
    header: 'Role & Department',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'department',
      primaryFieldLabel: 'Role',
      secondaryFieldLabel: 'Department',
    },
    filterConfig: {
      filterField: 'role',
      placeholder: 'Search By Role or Department',
    },
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: ['Active', 'Inactive', 'On Leave'],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'contactNumber',
    header: 'Contact Number',
    showFilter: false,
    showSort: false,
  },
  {
    field: 'email',
    header: 'Email',
    showFilter: false,
    showSort: false,
  },
  {
    field: 'dateOfJoining',
    header: 'Employment Period',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    dataType: ETableDataType.DATE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'dateOfLeaving',
      primaryFieldLabel: 'Joined On',
      secondaryFieldLabel: 'Left On',
      dataType: ETableDataType.DATE,
    },
    filterConfig: {
      filterField: 'dateOfJoining',
      placeholder: 'Search By Date',
      matchModeOptions: MATCH_MODE_OPTIONS.date,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
];  
