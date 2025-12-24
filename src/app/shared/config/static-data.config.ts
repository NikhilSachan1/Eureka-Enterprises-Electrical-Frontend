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
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Driver', value: 'DRIVER' },
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
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
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
  { label: 'Hotel', value: 'hotel' },
  { label: 'Tools', value: 'tools' },
  { label: 'Toll', value: 'toll_cash' },
  { label: 'Car Service', value: 'car_service' },
  { label: 'Train', value: 'train' },
  { label: 'Bus', value: 'bus' },
  { label: 'Local Transport', value: 'local_transport' },
  { label: 'Stationary', value: 'stationery' },
  { label: 'Saftey Equipment', value: 'safety_equipment' },
  { label: 'Performance Bonus', value: 'performance_bonus' },
  { label: 'Expense Settlement', value: 'settlement' },
  { label: 'Other', value: 'other' },
];
export const EXPENSE_PAYMENT_METHOD_DATA: IOptionDropdown[] = [
  { label: 'UPI', value: 'upi' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer (NEFT / RTGS / IMPS)', value: 'bank_transfer' },
];

export const EMPLOYEE_GENDER_DATA: IOptionDropdown[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const EMPLOYEE_BLOOD_GROUP_DATA: IOptionDropdown[] = [
  { label: 'A+', value: 'a_positive' },
  { label: 'A-', value: 'a_negative' },
  { label: 'B+', value: 'b_positive' },
  { label: 'B-', value: 'b_negative' },
  { label: 'AB+', value: 'ab_positive' },
  { label: 'AB-', value: 'ab_negative' },
  { label: 'O+', value: 'o_positive' },
  { label: 'O-', value: 'o_negative' },
];

export const INDIA_STATE_DATA: IOptionDropdown[] = [
  { label: 'Maharashtra', value: 'maharashtra' },
  { label: 'Uttar Pradesh', value: 'uttar_pradesh' },
  { label: 'Tamil Nadu', value: 'tamil_nadu' },
  { label: 'Karnataka', value: 'karnataka' },
  { label: 'Gujarat', value: 'gujarat' },
  { label: 'Rajasthan', value: 'rajasthan' },
  { label: 'West Bengal', value: 'west_bengal' },
  { label: 'Madhya Pradesh', value: 'madhya_pradesh' },
  { label: 'Telangana', value: 'telangana' },
  { label: 'Bihar', value: 'bihar' },
];

export const INDIA_CITY_DATA: Record<string, IOptionDropdown[]> = {
  maharashtra: [
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Pune', value: 'pune' },
    { label: 'Nagpur', value: 'nagpur' },
    { label: 'Nashik', value: 'nashik' },
    { label: 'Aurangabad', value: 'aurangabad' },
  ],

  uttar_pradesh: [
    { label: 'Lucknow', value: 'lucknow' },
    { label: 'Noida', value: 'noida' },
    { label: 'Ghaziabad', value: 'ghaziabad' },
    { label: 'Kanpur', value: 'kanpur' },
    { label: 'Varanasi', value: 'varanasi' },
    { label: 'Agra', value: 'agra' },
  ],

  tamil_nadu: [
    { label: 'Chennai', value: 'chennai' },
    { label: 'Coimbatore', value: 'coimbatore' },
    { label: 'Madurai', value: 'madurai' },
    { label: 'Salem', value: 'salem' },
  ],

  karnataka: [
    { label: 'Bengaluru', value: 'bengaluru' },
    { label: 'Mysuru', value: 'mysuru' },
    { label: 'Mangaluru', value: 'mangaluru' },
    { label: 'Hubballi', value: 'hubballi' },
    { label: 'Belagavi', value: 'belagavi' },
  ],

  gujarat: [
    { label: 'Ahmedabad', value: 'ahmedabad' },
    { label: 'Surat', value: 'surat' },
    { label: 'Vadodara', value: 'vadodara' },
    { label: 'Rajkot', value: 'rajkot' },
  ],

  rajasthan: [
    { label: 'Jaipur', value: 'jaipur' },
    { label: 'Jodhpur', value: 'jodhpur' },
    { label: 'Udaipur', value: 'udaipur' },
    { label: 'Kota', value: 'kota' },
  ],

  west_bengal: [
    { label: 'Kolkata', value: 'kolkata' },
    { label: 'Howrah', value: 'howrah' },
    { label: 'Durgapur', value: 'durgapur' },
    { label: 'Siliguri', value: 'siliguri' },
  ],

  madhya_pradesh: [
    { label: 'Bhopal', value: 'bhopal' },
    { label: 'Indore', value: 'indore' },
    { label: 'Gwalior', value: 'gwalior' },
    { label: 'Jabalpur', value: 'jabalpur' },
  ],

  telangana: [
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Warangal', value: 'warangal' },
    { label: 'Karimnagar', value: 'karimnagar' },
  ],

  bihar: [
    { label: 'Patna', value: 'patna' },
    { label: 'Gaya', value: 'gaya' },
    { label: 'Bhagalpur', value: 'bhagalpur' },
  ],
};

export const EMPLOYMENT_TYPE_DATA: IOptionDropdown[] = [
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
  { label: 'Part-Time', value: 'part_time' },
  { label: 'Full-Time', value: 'full_time' },
];

export const DESIGNATION_DATA: IOptionDropdown[] = [
  { label: 'Sr. Testing Engineer', value: 'sr_testing_engineer' },
  { label: 'Associate Testing Engineer', value: 'associate_testing_engineer' },
  { label: 'Jr. Testing Engineer', value: 'jr_testing_engineer' },
  { label: 'Driver', value: 'driver' },
  { label: 'Human Resource (HR)', value: 'human_resource_hr' },
  { label: 'Accountant', value: 'accountant' },
];

export const DEGREE_DATA: IOptionDropdown[] = [
  { label: 'B.Tech', value: 'b_tech' },
  { label: 'M.Tech', value: 'm_tech' },
  { label: 'B.Sc', value: 'b_sc' },
  { label: 'M.Sc', value: 'm_sc' },
  { label: 'B.A', value: 'b_a' },
  { label: 'M.A', value: 'm_a' },
  { label: 'B.Com', value: 'b_com' },
  { label: 'M.Com', value: 'm_com' },
];

export const BRANCH_DATA: IOptionDropdown[] = [
  {
    label: 'Computer Science and Engineering',
    value: 'computer_science_engineering',
  },
  {
    label: 'Electronics and Communication Engineering',
    value: 'electronics_communication_engineering',
  },
  {
    label: 'Electrical and Electronics Engineering',
    value: 'electrical_electronics_engineering',
  },
  { label: 'Mechanical Engineering', value: 'mechanical_engineering' },
  { label: 'Civil Engineering', value: 'civil_engineering' },
  { label: 'Chemical Engineering', value: 'chemical_engineering' },
  { label: 'Biotechnology', value: 'biotechnology' },
  { label: 'Other', value: 'other' },
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
