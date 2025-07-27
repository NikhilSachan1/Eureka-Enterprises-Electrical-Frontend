import { IOptionDropdown } from '@shared/models';

export const MODULES_NAME_DATA: IOptionDropdown[] = [
  { label: 'Employee', value: 'employee' },
  { label: 'Attendance', value: 'attendance' },
  { label: 'Leave', value: 'leave' },
  { label: 'Payroll', value: 'payroll' },
];

export const MODULE_ACTIONS_DATA: Record<string, IOptionDropdown[]> = {
  employee: [
    { value: 'add', label: 'Add' },
    { value: 'delete', label: 'Delete' },
    { value: 'edit', label: 'Edit' },
    { value: 'view', label: 'Table View' },
    { value: 'view_detail', label: 'View Detail' },
  ],
  attendance: [
    { value: 'apply', label: 'Apply' },
    { value: 'force', label: 'Force' },
    { value: 'view', label: 'Table View' },
    { value: 'view_detail', label: 'View Detail' },
    { value: 'regularize', label: 'Regularize' },
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' },
  ],
};

export const ROLE_NAME_DATA: IOptionDropdown[] = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Project Manager', value: 'project_manager' },
  { label: 'Site Supervisor', value: 'site_supervisor' },
  { label: 'Field Worker', value: 'field_worker' },
  { label: 'HR Manager', value: 'hr_manager' },
  { label: 'Finance Officer', value: 'finance_officer' },
];

export const ATTENDANCE_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'On Leave', value: 'on_leave' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Checked Out', value: 'checked_out' },
];

export const APPROVAL_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export const EMPLOYEE_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];
