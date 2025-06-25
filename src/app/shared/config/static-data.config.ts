import { IOptionDropdown } from "../models";

export const MODULES_DATA: IOptionDropdown[] = [
  { label: 'Employee', value: 'employee' },
  { label: 'Attendance', value: 'attendance' },
];

export const MODULE_ACTIONS_DATA: Record<string, IOptionDropdown[]> = {
  employee: [
    { value: 'add', label: 'Add Employee' },
    { value: 'delete', label: 'Delete Employee' },
    { value: 'edit', label: 'Edit Employee' },
    { value: 'view', label: 'View Employee' },
    { value: 'view-details', label: 'View Employee Details' }
  ],
  attendance: [
    { value: 'apply', label: 'Apply Attendance' },
    { value: 'force', label: 'Force Attendance' },
    { value: 'view', label: 'View Attendance' },
    { value: 'view-details', label: 'View Attendance Details' },
    { value: 'regularize', label: 'Regularize Attendance' },
    { value: 'approve', label: 'Approve Attendance' },
    { value: 'reject', label: 'Reject Attendance' }
  ],
};