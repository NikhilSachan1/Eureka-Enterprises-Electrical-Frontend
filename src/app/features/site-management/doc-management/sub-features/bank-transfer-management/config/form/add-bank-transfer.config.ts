import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IAddBankTransferUIFormDto } from '../../types/bank-transfer.dto';
import { EPaymentTypeFilter } from '@features/site-management/doc-management/shared/config/payment-filter.config';
import { PAYMENT_TYPE_LABEL } from '@features/site-management/doc-management/shared/utils/tax-register-status.util';
import { PAYMENT_RECORD_MODE_FIELD_CONFIG } from '@features/centralized-payment-management/payment-sheet-management/config/form/payment-record-mode.config';

/**
 * Invoice payment: Book Payment waits for the invoice. Advance / GST release have no invoice step,
 * so the component drops this dependency and lists the project's bookings of that type.
 */
export const BOOK_PAYMENT_BY_INVOICE_DEPENDENCY = {
  dependsOnField: 'invoiceNumber',
  dependsOnFieldLabel: 'an invoice',
};

const ADD_BANK_TRANSFER_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddBankTransferUIFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
      validators: [Validators.required],
    },
    recordMode: {
      ...PAYMENT_RECORD_MODE_FIELD_CONFIG,
      // Vendor transfer only; a bank receipt never goes on a payment sheet.
      validators: [],
      conditionalValidators: [
        {
          shouldApply: (context): boolean =>
            context.docContext === EDocContext.PURCHASE,
          validators: [Validators.required],
        },
      ],
    },
    paymentType: {
      fieldType: EDataType.SELECT,
      id: 'paymentType',
      fieldName: 'paymentType',
      label: 'Payment Type',
      selectConfig: {
        optionsDropdown: [
          {
            label: PAYMENT_TYPE_LABEL.INVOICE,
            value: EPaymentTypeFilter.INVOICE,
          },
          {
            label: PAYMENT_TYPE_LABEL.ADVANCE,
            value: EPaymentTypeFilter.ADVANCE,
          },
          {
            label: PAYMENT_TYPE_LABEL.GST_RELEASE,
            value: EPaymentTypeFilter.GST,
          },
        ],
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean =>
            context.docContext === EDocContext.PURCHASE,
          validators: [Validators.required],
        },
      ],
    },
    invoiceNumber: {
      fieldType: EDataType.SELECT,
      id: 'invoiceNumber',
      fieldName: 'invoiceNumber',
      label: 'Invoice Number',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      // Sales always picks an invoice; a vendor transfer only for an invoice payment.
      conditionalValidators: [
        {
          dependsOn: 'paymentType',
          shouldApply: (paymentType: unknown, context): boolean =>
            context?.['docContext'] === EDocContext.SALES ||
            paymentType === EPaymentTypeFilter.INVOICE,
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    bookPaymentNumber: {
      fieldType: EDataType.SELECT,
      id: 'bookPaymentNumber',
      fieldName: 'bookPaymentNumber',
      label: 'Book Payment',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: BOOK_PAYMENT_BY_INVOICE_DEPENDENCY,
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            return context.docContext === EDocContext.PURCHASE;
          },
          validators: [Validators.required],
        },
      ],
    },
    paidFromAccount: {
      fieldType: EDataType.SELECT,
      id: 'paidFromAccount',
      fieldName: 'paidFromAccount',
      label: 'Paid From Account',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY_BANK_ACCOUNT,
          dropdownName:
            CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
        },
        showClearButton: true,
      },
      validators: [Validators.required],
    },
    utrNumber: {
      fieldType: EDataType.TEXT,
      id: 'utrNumber',
      fieldName: 'utrNumber',
      label: 'UTR / Reference No.',
      validators: [Validators.required],
    },
    transferDate: {
      fieldType: EDataType.DATE,
      id: 'transferDate',
      fieldName: 'transferDate',
      label: 'Transfer Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    transferAmount: {
      fieldType: EDataType.NUMBER,
      id: 'transferAmount',
      fieldName: 'transferAmount',
      label: 'Transfer Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            return context.docContext === EDocContext.SALES;
          },
          validators: [Validators.required, Validators.min(0)],
        },
      ],
    },
    proofAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'proofAttachment',
      fieldName: 'proofAttachment',
      label: 'Proof of transfer',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const ADD_BANK_TRANSFER_FORM_CONFIG: IFormConfig<IAddBankTransferUIFormDto> =
  {
    fields: ADD_BANK_TRANSFER_FORM_FIELDS_CONFIG,
  };
