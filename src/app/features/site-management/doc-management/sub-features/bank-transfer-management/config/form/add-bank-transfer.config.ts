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
      validators: [Validators.required],
    },
    bookPaymentNumber: {
      fieldType: EDataType.SELECT,
      id: 'bookPaymentNumber',
      fieldName: 'bookPaymentNumber',
      label: 'Book Payment',
      selectConfig: {
        optionsDropdown: [],
        dependentDropdown: {
          dependsOnField: 'invoiceNumber',
          dependsOnFieldLabel: 'an invoice',
        },
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
