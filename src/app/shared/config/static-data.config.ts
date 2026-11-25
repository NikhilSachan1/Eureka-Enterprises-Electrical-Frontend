import { IOptionDropdown } from '@shared/types';

export const SHIFT_DATA = {
  START_TIME: '09:00',
  END_TIME: '18:00',
};

export const PAYSLIP_DATE_DATA = {
  EVERY_MONTH: 10,
  CURRENT_MONTH: false,
};

export const CONFIGURATION_TYPE_DATA: IOptionDropdown[] = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'date' },
  { label: 'Array', value: 'array' },
  { label: 'JSON', value: 'json' },
];

export const SITE_ALLOCATION_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Free', value: 'FREE' },
  { label: 'Allocated', value: 'ALLOCATED' },
];

export const INITIATED_STATUS_FILTER_DATA: IOptionDropdown[] = [
  { label: 'Initiated', value: 'INITIATED' },
];

/** Indian FY quarters (API `quarter`): Q1 = Apr–Jun … Q4 = Jan–Mar. */
export const FINANCIAL_QUARTER_DATA: IOptionDropdown[] = [
  { label: 'Q1 (Apr – Jun)', value: 'Q1' },
  { label: 'Q2 (Jul – Sep)', value: 'Q2' },
  { label: 'Q3 (Oct – Dec)', value: 'Q3' },
  { label: 'Q4 (Jan – Mar)', value: 'Q4' },
];

/** Invoice payment after advances (API `paymentStatus`). */
export const INVOICE_PAYMENT_STATUS_DATA: IOptionDropdown[] = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Partially paid', value: 'PARTIAL' },
  { label: 'Unpaid', value: 'UNPAID' },
];

/** First Indian FY offered in financial-year filters. */
const FIRST_FINANCIAL_YEAR_START = 2020;

/**
 * Indian FYs from the first one in use up to the current one, newest first
 * (value "2024-25", label "FY 2024-25"). Worked out once, when the app loads.
 */
export const FINANCIAL_YEAR_DATA: IOptionDropdown[] =
  ((): IOptionDropdown[] => {
    const today = new Date();
    const currentStart =
      today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const years: IOptionDropdown[] = [];
    for (
      let start = currentStart;
      start >= FIRST_FINANCIAL_YEAR_START;
      start--
    ) {
      const value = `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
      years.push({ label: `FY ${value}`, value });
    }
    return years;
  })();
