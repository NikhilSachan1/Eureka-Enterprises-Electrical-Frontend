import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_BANK_TRANSFER_FORM_CONFIG } from './add-bank-transfer.config';
import { IEditBankTransferUIFormDto } from '../../types/bank-transfer.dto';

// Add-only choices: payment type steers how the book payment is found, record mode whether a
// payment sheet is created. Edit keeps the transfer's own links.
const ADD_ONLY_FIELDS = new Set(['paymentType', 'recordMode']);
const ADD_FIELDS_FOR_EDIT = Object.fromEntries(
  Object.entries(ADD_BANK_TRANSFER_FORM_CONFIG.fields).filter(
    ([fieldName]) => !ADD_ONLY_FIELDS.has(fieldName)
  )
) as Omit<
  typeof ADD_BANK_TRANSFER_FORM_CONFIG.fields,
  'paymentType' | 'recordMode'
>;

const EDIT_BANK_TRANSFER_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditBankTransferUIFormDto> =
  {
    ...ADD_FIELDS_FOR_EDIT,
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
