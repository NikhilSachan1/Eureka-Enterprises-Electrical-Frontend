import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ICompanyAddFormDto } from '../../types/company.dto';
import { Validators } from '@angular/forms';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';

const ADD_COMPANY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ICompanyAddFormDto> =
  {
    companyName: {
      id: 'companyName',
      fieldName: 'companyName',
      label: 'Company Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    state: {
      id: 'state',
      fieldName: 'state',
      label: 'State',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMMON,
          dropdownName: CONFIGURATION_KEYS.COMMON.STATES,
        },
      },
      validators: [Validators.required],
    },
    city: {
      id: 'city',
      fieldName: 'city',
      label: 'City',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dependentDropdown: {
          dependsOnField: 'state',
          optionsProviderMethod: 'getCitiesByState',
        },
      },
      validators: [Validators.required],
    },
    pincode: {
      id: 'pincode',
      fieldName: 'pincode',
      label: 'Pin Code',
      fieldType: EDataType.TEXT,
      textConfig: {
        minimumInputLength: 6,
        maximumInputLength: 6,
        regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
      },
      validators: [Validators.minLength(6), Validators.maxLength(6)],
    },
    parentCompanyName: {
      id: 'parentCompanyName',
      fieldName: 'parentCompanyName',
      label: 'Parent Company Name',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY,
          dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        },
      },
    },
  };

const ADD_COMPANY_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Company',
    tooltip: 'Add a new company',
  },
};

export const ADD_COMPANY_FORM_CONFIG: IFormConfig<ICompanyAddFormDto> = {
  fields: ADD_COMPANY_FORM_FIELDS_CONFIG,
  buttons: ADD_COMPANY_FORM_BUTTONS_CONFIG,
};
