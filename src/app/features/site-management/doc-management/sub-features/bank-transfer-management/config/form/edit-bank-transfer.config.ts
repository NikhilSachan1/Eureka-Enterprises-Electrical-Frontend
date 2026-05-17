import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_BANK_TRANSFER_FORM_CONFIG } from './add-bank-transfer.config';
import { IEditBankTransferUIFormDto } from '../../types/bank-transfer.dto';

const EDIT_BANK_TRANSFER_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditBankTransferUIFormDto> =
  {
    ...ADD_BANK_TRANSFER_FORM_CONFIG.fields,
    projectName: {
      ...ADD_BANK_TRANSFER_FORM_CONFIG.fields.projectName,
      disabledInput: true,
    },
    invoiceNumber: {
      ...ADD_BANK_TRANSFER_FORM_CONFIG.fields.invoiceNumber,
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
