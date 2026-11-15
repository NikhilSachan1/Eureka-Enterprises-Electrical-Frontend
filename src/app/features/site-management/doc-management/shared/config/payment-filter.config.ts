import {
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config/input-field.config';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { EDocContext } from '../../types/doc.enum';
import { PAYMENT_TYPE_LABEL } from '../utils/tax-register-status.util';

/** "Payment type" filter values, the same for bookings and bank transfers (API `paymentType`). */
export enum EPaymentTypeFilter {
  INVOICE = 'INVOICE',
  ADVANCE = 'ADVANCE',
  GST = 'GST',
}

/**
 * Payment type filter for one side. Vendor: invoice, advance, GST release. Contractor: invoice,
 * GST receipt (no advances on the sales side).
 */
export function getPaymentTypeFilterFieldConfig(
  side: EDocContext | null | undefined
): IInputFieldsConfig {
  const isSales = side === EDocContext.SALES;
  const optionsDropdown = [
    { label: PAYMENT_TYPE_LABEL.INVOICE, value: EPaymentTypeFilter.INVOICE },
    ...(isSales
      ? []
      : [
          {
            label: PAYMENT_TYPE_LABEL.ADVANCE,
            value: EPaymentTypeFilter.ADVANCE,
          },
        ]),
    {
      label: isSales
        ? PAYMENT_TYPE_LABEL.GST_RECEIPT
        : PAYMENT_TYPE_LABEL.GST_RELEASE,
      value: EPaymentTypeFilter.GST,
    },
  ];

  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'paymentType',
    fieldName: 'paymentType',
    label: 'Payment type',
    placeholder: 'All payment types',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      optionsDropdown,
      showClearButton: true,
    },
  } as IInputFieldsConfig;
}

/** Booking: has its bank transfer been made yet (API `hasTransfer`). */
export const BOOKING_TRANSFER_FILTER_FIELD_CONFIG: IInputFieldsConfig = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  fieldType: EDataType.SELECT,
  id: 'hasTransfer',
  fieldName: 'hasTransfer',
  label: 'Bank transfer',
  placeholder: 'All bookings',
  selectConfig: {
    ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
    optionsDropdown: [
      { label: 'Transfer done', value: 'true' },
      { label: 'Transfer pending', value: 'false' },
    ],
    showClearButton: true,
  },
} as IInputFieldsConfig;
