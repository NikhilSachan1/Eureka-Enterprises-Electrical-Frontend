import { IOptionDropdown } from '@shared/types';

export const SHIFT_DATA = {
  START_TIME: '09:00',
  END_TIME: '18:00',
};

export const PAYSLIP_DATE_DATA = {
  EVERY_MONTH: 1,
};

export const EMPLOYEE_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export const PASSING_YEAR_DATA: IOptionDropdown[] = [
  { label: '2020', value: '2020' },
  { label: '2021', value: '2021' },
  { label: '2022', value: '2022' },
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
];

export const BANK_NAME_DATA: IOptionDropdown[] = [
  { label: 'SBI', value: 'sbi' },
  { label: 'HDFC', value: 'hdfc' },
  { label: 'ICICI', value: 'icici' },
  { label: 'Axis', value: 'axis' },
  { label: 'Bank of Baroda', value: 'bank_of_baroda' },
  { label: 'Bank of India', value: 'bank_of_india' },
  { label: 'Bank of Maharashtra', value: 'bank_of_maharashtra' },
];

export const ATTENDANCE_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Leave', value: 'leave' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Checked In', value: 'checkedIn' },
  { label: 'Checked Out', value: 'checkedOut' },
];

export const APPROVAL_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const PETRO_CARD_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Allocated', value: 'allocated' },
  { label: 'Available', value: 'available' },
];

export const COMPANY_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Active', value: 'true' },
  { label: 'Archived', value: 'false' },
];

export const CONTRACTOR_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Active', value: 'true' },
  { label: 'Archived', value: 'false' },
];
