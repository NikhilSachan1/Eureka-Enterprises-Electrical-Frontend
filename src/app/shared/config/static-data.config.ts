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

export const INDIA_CITY_BY_STATE_DATA: Record<string, IOptionDropdown[]> = {
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

export const INDIA_ALL_CITIES_DATA: IOptionDropdown[] = Object.values(
  INDIA_CITY_BY_STATE_DATA
)
  .flat()
  .sort((a, b) => a.label.localeCompare(b.label));

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
