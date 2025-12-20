import { DatePipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { PAYSLIP_DATE_DATA } from '@shared/config/static-data.config';

export const convertSecondsToDhms = (seconds: number): string => {
  if (!seconds || seconds < 0) {
    return '00:00:00';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

const pad = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const getPayslipCutoffMinDate = (): Date => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const cutOffDate = PAYSLIP_DATE_DATA.EVERY_MONTH;

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const cutoffDate = new Date(currentYear, currentMonth, cutOffDate);

  if (today <= cutoffDate) {
    return new Date(prevMonthYear, prevMonth, 1);
  }
  return new Date(currentYear, currentMonth, 1);
};

export const transformDateFormat = (
  value: string | Date,
  dateFormat: string = APP_CONFIG.DATE_FORMATS.API
): string => {
  const datePipe = new DatePipe('en-US');
  return datePipe.transform(value, dateFormat) as string;
};

export const getDateBeforeXDays = (xDays: number): Date => {
  return new Date(new Date().setDate(new Date().getDate() - xDays));
};
