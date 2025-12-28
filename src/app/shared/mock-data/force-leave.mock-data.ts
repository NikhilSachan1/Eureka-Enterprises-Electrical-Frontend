import {
  getRandomDate,
  getRandomItem,
  TEST_EMPLOYEE_LIST,
} from './mock-data.constants';

// Generate a random leave date range (start date and end date)
const startDate = getRandomDate(15, 7); // ~15 days old, ±7 days range
const endDate = new Date(startDate);
endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days duration

export const FORCE_LEAVE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: getRandomItem(TEST_EMPLOYEE_LIST),
  leaveDate: [new Date(startDate), new Date(endDate)],
  description: 'Medical leave - retroactive entry',
  approvalReason: 'Approved due to medical emergency',
};
