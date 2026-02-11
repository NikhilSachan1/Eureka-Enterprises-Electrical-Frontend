import { IEmployeeGetResponseDto } from '@features/employee-management/types/employee.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

const EMPLOYEE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No employee record found.',
  emptyMessageDescription:
    "You don't have any employee record yet. Please add a employee record first.",
};

const EMPLOYEE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'employeeCode' },
    showImage: true,
    dummyImageField: 'employeeName',
    primaryFieldHighlight: true,
    serverSideFilterAndSortConfig: {
      sortField: 'userName',
    },
  },
  {
    field: 'email',
    header: 'Email ID',
    bodyTemplate: EDataType.EMAIL,
    showSort: false,
  },
  {
    field: 'contactNumber',
    header: 'Contact Number',
    bodyTemplate: EDataType.PHONE,
    showSort: false,
  },
  {
    field: 'employeeType',
    header: 'Employee Type',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'designation',
    header: 'Designation',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'dateOfJoining',
    header: 'Joining Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
];

const EMPLOYEE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IEmployeeGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Employee profile',
  },
  {
    id: EButtonActionType.SEND_PASSWORD_LINK,
    tooltip: 'Send Password Link',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Employee',
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Employee Status',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Employee',
  },
];

const EMPLOYEE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IEmployeeGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Employee',
  },
  {
    id: EButtonActionType.SEND_PASSWORD_LINK,
    tooltip: 'Send Password Link to Selected',
    label: 'Send Password Link',
  },
];

export const EMPLOYEE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IEmployeeGetResponseDto['records'][number]
> = {
  tableConfig: EMPLOYEE_TABLE_CONFIG,
  headers: EMPLOYEE_TABLE_HEADER_CONFIG,
  rowActions: EMPLOYEE_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: EMPLOYEE_TABLE_BULK_ACTIONS_CONFIG,
};
