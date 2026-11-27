import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_BANK_TRANSFER_FORM_CONFIG } from './add-bank-transfer.config';
import { IEditBankTransferUIFormDto } from '../../types/bank-transfer.dto';

// Payment type only steers how Add finds the book payment; edit keeps the transfer's own links.
const ADD_FIELDS_WITHOUT_PAYMENT_TYPE = Object.fromEntries(
  Object.entries(ADD_BANK_TRANSFER_FORM_CONFIG.fields).filter(
    ([fieldName]) => fieldName !== 'paymentType'
  )
) as Omit<typeof ADD_BANK_TRANSFER_FORM_CONFIG.fields, 'paymentType'>;

const EDIT_BANK_TRANSFER_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditBankTransferUIFormDto> =
  {
    ...ADD_FIELDS_WITHOUT_PAYMENT_TYPE,
    projectName: {
      ...ADD_BANK_TRANSFER_FORM_CONFIG.fields.projectName,
      disabledInput: true,
    },
    invoiceNumber: {
      ...ADD_BANK_TRANSFER_FORM_CONFIG.fields.invoiceNumber,
      // Read-only here; the Add rule (cleared unless payment type is Invoice) must not run.
      conditionalValidators: undefined,
      disabledInput: true,
    },
    bookPaymentNumber: {
      ...ADD_BANK_TRANSFER_FORM_CONFIG.fields.bookPaymentNumber,
      disabledInput: true,
    },
  };

export const EDIT_BANK_TRANSFER_FORM_CONFIG: IFormConfig<IEditBankTransferUIFormDto> =
  {
    fields: EDIT_BANK_TRANSFER_FORM_FIELDS_CONFIG,
  };
