import { IOptionDropdown } from '@shared/types';

export const MODULES_NAME_DATA: IOptionDropdown[] = [
  { label: 'Attendance', value: 'attendance' },
  { label: 'System Permission', value: 'system_permission' },
  { label: 'User Permission', value: 'user_permission' },
  { label: 'Role Permission', value: 'role_permission' },
];

export const MODULE_ACTIONS_DATA: Record<string, IOptionDropdown[]> = {
  attendance: [
    { value: 'apply', label: 'Apply' },
    { value: 'force', label: 'Force' },
    { value: 'view', label: 'Table View' },
    { value: 'view_detail', label: 'View Detail' },
    { value: 'regularize', label: 'Regularize' },
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' },
  ],
  system_permission: [
    { value: 'add', label: 'Add' },
    { value: 'edit', label: 'Edit' },
    { value: 'delete', label: 'Delete' },
  ],
  user_permission: [
    { value: 'delete', label: 'Delete' },
    { value: 'set', label: 'Set Permission' },
  ],
  role_permission: [
    { value: 'add', label: 'Add' },
    { value: 'edit', label: 'Edit' },
    { value: 'delete', label: 'Delete' },
    { value: 'set', label: 'Set Permission' },
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
  { label: 'Leave', value: 'leave' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Checked Out', value: 'checked_out' },
];

export const APPROVAL_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const EMPLOYEE_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const EMPLOYEE_NAME_DATA: IOptionDropdown[] = [
  { label: 'Akhil Sachan', value: '508eee21-d0fb-45cf-9cfa-a7d83e8531e5' },
  { label: 'System Admin', value: '41b4006e-c0d5-47cb-93dc-2422890c0c91' },
];

export const CLIENT_NAME_DATA: IOptionDropdown[] = [
  { label: 'Client 1', value: 'client_1' },
  { label: 'Client 2', value: 'client_2' },
  { label: 'Client 3', value: 'client_3' },
  { label: 'Client 4', value: 'client_4' },
  { label: 'Client 5', value: 'client_5' },
];

export const LOCATION_DATA: IOptionDropdown[] = [
  { label: 'Location 1', value: 'location_1' },
  { label: 'Location 2', value: 'location_2' },
  { label: 'Location 3', value: 'location_3' },
  { label: 'Location 4', value: 'location_4' },
  { label: 'Location 5', value: 'location_5' },
];

export const VEHICLE_LIST_DATA: IOptionDropdown[] = [
  { label: 'Vehicle 1', value: 'vehicle_1' },
  { label: 'Vehicle 2', value: 'vehicle_2' },
  { label: 'Vehicle 3', value: 'vehicle_3' },
  { label: 'Vehicle 4', value: 'vehicle_4' },
  { label: 'Vehicle 5', value: 'vehicle_5' },
];

export const SHIFT_DATA = {
  START_TIME: '09:00',
  END_TIME: '18:00',
};

export const PAYSLIP_DATE_DATA = {
  EVERY_MONTH: 5,
};

export const LEAVE_DAY_TYPE_DATA: IOptionDropdown[] = [
  { label: 'Full Day', value: 'FULL_DAY' },
  { label: 'Half Day', value: 'HALF_DAY' },
];

export const LEAVE_TYPE_DATA: IOptionDropdown[] = [
  { value: 'earned', label: 'Earned Leave' },
  { value: 'casual', label: 'Casual Leave' },
];

// Expense Management
export const EXPENSE_CATEGORY_DATA: IOptionDropdown[] = [
  { label: 'Hotel', value: 'hotel_stay' },
  { label: 'Tools', value: 'tools' },
  { label: 'Toll', value: 'toll_cash' },
  { label: 'Car Service', value: 'car_service' },
  { label: 'Train', value: 'train' },
  { label: 'Bus', value: 'bus' },
  { label: 'Local Transport', value: 'local_transport' },
  { label: 'Stationary', value: 'stationery' },
  { label: 'Saftey Equipment', value: 'safety_equipment' },
  { label: 'Other', value: 'other' },
];
export const EXPENSE_PAYMENT_METHOD_DATA: IOptionDropdown[] = [
  { label: 'UPI', value: 'upi' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer (NEFT / RTGS / IMPS)', value: 'bank_transfer' },
];
