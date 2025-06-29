import { IOptionDropdown } from "../models";

export const MODULES_NAME_DATA: IOptionDropdown[] = [
  { label: 'Employee', value: 'employee' },
  { label: 'Attendance', value: 'attendance' },
];

export const MODULE_ACTIONS_DATA: Record<string, IOptionDropdown[]> = {
  employee: [
    { value: 'add', label: 'Add' },
    { value: 'delete', label: 'Delete' },
    { value: 'edit', label: 'Edit' },
    { value: 'view', label: 'Table View' },
    { value: 'view_detail', label: 'View Detail' }
  ],
  attendance: [
    { value: 'apply', label: 'Apply' },
    { value: 'force', label: 'Force' },
    { value: 'view', label: 'Table View' },
    { value: 'view_detail', label: 'View Detail' },
    { value: 'regularize', label: 'Regularize' },
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' }
  ],
};