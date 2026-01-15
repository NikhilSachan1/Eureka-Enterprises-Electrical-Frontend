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

export const getPayslipCutoffMaxDate = (): Date => {
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const payslipGenerationDate = PAYSLIP_DATE_DATA.EVERY_MONTH;

  let maxMonth: number;
  let maxYear: number;

  let previousMonth: number;
  let previousYear: number;

  if (currentMonth === 0) {
    previousMonth = 11;
    previousYear = currentYear - 1;
  } else {
    previousMonth = currentMonth - 1;
    previousYear = currentYear;
  }

  if (currentDate < payslipGenerationDate) {
    if (previousMonth === 0) {
      maxMonth = 11;
      maxYear = previousYear - 1;
    } else {
      maxMonth = previousMonth - 1;
      maxYear = previousYear;
    }
  } else {
    maxMonth = previousMonth;
    maxYear = previousYear;
  }

  return new Date(maxYear, maxMonth + 1, 0);
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

export const formatMonthYear = (month: number, year: number): string => {
  const datePipe = new DatePipe('en-US');
  const date = new Date(year, month - 1, 1);
  return datePipe.transform(date, APP_CONFIG.DATE_FORMATS.MONTH_YEAR) as string;
};
