import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../shared/models/data-table-config.model';
import { MATCH_MODE_OPTIONS } from '../../../shared/config/data-table.config';

export const EMPLOYEE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: 'setInactive',
    label: 'Set In-active',
    icon: 'pi pi-user-minus',
    severity: 'primary',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: 'danger',
  },
];

export const EMPLOYEE_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: 'view',
    icon: 'pi pi-eye',
    tooltip: 'View Profile',
    severity: 'info',
  },
  {
    id: 'edit',
    icon: 'pi pi-pencil',
    tooltip: 'Edit Employee',
    severity: 'warning',
  },
  {
    id: 'delete',
    icon: 'pi pi-trash',
    tooltip: 'Delete Employee',
    severity: 'danger',
  },
];

export const EMPLOYEE_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
    globalFilterFields: ['name', 'role', 'email', 'status'],
};

export const EMPLOYEE_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Employee Name',
    bodyTemplate: 'textWithSubtitleAndImage', 
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
    bodyTemplate: 'textWithSubtitleAndImage',
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
    bodyTemplate: 'status',
    filterConfig: {
      filterField: 'status',
      searchInputType: 'dropdown',
      filterDropdownOptions: ['Active', 'Inactive', 'On Leave'],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: 'equals',
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
    bodyTemplate: 'textWithSubtitleAndImage',
    dataType: 'date',
    textWithSubtitleAndImageConfig: {
      secondaryField: 'dateOfLeaving',
      primaryFieldLabel: 'Joined On',
      secondaryFieldLabel: 'Left On',
      dataType: 'date',
    },
    filterConfig: {
      filterField: 'dateOfJoining',
      placeholder: 'Search By Date',
      matchModeOptions: MATCH_MODE_OPTIONS.date,
      defaultMatchMode: 'equals',
    },
  },
]; 