import { IOptionDropdown } from '@shared/types';

export const SHIFT_DATA = {
  START_TIME: '09:00',
  END_TIME: '18:00',
};

export const PAYSLIP_DATE_DATA = {
  EVERY_MONTH: 25,
};

export const CONFIGURATION_TYPE_DATA: IOptionDropdown[] = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'date' },
  { label: 'Array', value: 'array' },
  { label: 'JSON', value: 'json' },
];
