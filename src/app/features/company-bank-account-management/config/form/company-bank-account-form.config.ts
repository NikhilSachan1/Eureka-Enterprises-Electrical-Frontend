import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ICompanyBankAccountAddFormDto } from '../../types/company-bank-account.dto';

const COMPANY_BANK_ACCOUNT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ICompanyBankAccountAddFormDto> =
  {
    bankName: {
      id: 'bankName',
      fieldName: 'bankName',
      label: 'Bank Name',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES,
        },
      },
      validators: [Validators.required],
    },
    accountHolderName: {
      id: 'accountHolderName',
      fieldName: 'accountHolderName',
      label: 'Account Holder Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHABETS_WITH_SPACES,
      },
      validators: [Validators.required],
    },
    accountNumber: {
      id: 'accountNumber',
      fieldName: 'accountNumber',
      label: 'Account Number',
      fieldType: EDataType.TEXT,
      textConfig: {
        minimumInputLength: 9,
        maximumInputLength: 18,
        regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
      },
      validators: [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(18),
      ],
    },
    ifscCode: {
      id: 'ifscCode',
      fieldName: 'ifscCode',
      label: 'IFSC Code',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        minimumInputLength: 11,
        maximumInputLength: 11,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
      validators: [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ],
    },
    branchName: {
      id: 'branchName',
      fieldName: 'branchName',
      label: 'Branch Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ADDRESS,
      },
      validators: [Validators.required],
    },
  };

const ADD_COMPANY_BANK_ACCOUNT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Company Bank Account',
    tooltip: 'Add a new company bank account',
  },
};

export const ADD_COMPANY_BANK_ACCOUNT_FORM_CONFIG: IFormConfig<ICompanyBankAccountAddFormDto> =
  {
    fields: COMPANY_BANK_ACCOUNT_FORM_FIELDS_CONFIG,
    buttons: ADD_COMPANY_BANK_ACCOUNT_FORM_BUTTONS_CONFIG,
  };

const EDIT_COMPANY_BANK_ACCOUNT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Company Bank Account',
    tooltip: 'Update company bank account details',
  },
};

export const EDIT_COMPANY_BANK_ACCOUNT_FORM_CONFIG: IFormConfig<ICompanyBankAccountAddFormDto> =
  {
    fields: COMPANY_BANK_ACCOUNT_FORM_FIELDS_CONFIG,
    buttons: EDIT_COMPANY_BANK_ACCOUNT_FORM_BUTTONS_CONFIG,
  };
