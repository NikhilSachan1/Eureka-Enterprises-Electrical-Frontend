import {
  getRandomItemFromDropdown,
  getRandomDate,
} from './mock-data.constants';
import { EMPLOYEE_NAME_DATA } from '@shared/config/static-data.config';

// Generate a random leave date range (start date and end date)
const startDate = getRandomDate(15, 7); // ~15 days old, ±7 days range
const endDate = new Date(startDate);
endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days duration

export const FORCE_LEAVE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: getRandomItemFromDropdown(EMPLOYEE_NAME_DATA),
  leaveDate: [new Date(startDate), new Date(endDate)],
  description: 'Medical leave - retroactive entry',
  approvalReason: 'Approved due to medical emergency',
};
