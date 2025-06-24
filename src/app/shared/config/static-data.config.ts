import { IOptionDropdown } from "../models/input-fields-config.model";

export const MODULES_DATA = [
  { value: 'Employee', key: 'employee' },
  { value: 'Attendance', key: 'attendance' },
];

export const MODULE_ACTIONS_DATA: Record<string, IOptionDropdown[]> = {
  employee: [
    { value: 'add', key: 'Add Employee' },
    { value: 'delete', key: 'Delete Employee' },
    { value: 'edit', key: 'Edit Employee' },
    { value: 'view', key: 'View Employee' },
    { value: 'view-details', key: 'View Employee Details' }
  ],
  attendance: [
    { value: 'apply', key: 'Apply Attendance' },
    { value: 'force', key: 'Force Attendance' },
    { value: 'view', key: 'View Attendance' },
    { value: 'view-details', key: 'View Attendance Details' },
    { value: 'regularize', key: 'Regularize Attendance' },
    { value: 'approve', key: 'Approve Attendance' },
    { value: 'reject', key: 'Reject Attendance' }
  ],
};