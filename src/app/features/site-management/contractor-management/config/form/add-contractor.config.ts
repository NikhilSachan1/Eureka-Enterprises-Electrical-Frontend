import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { Validators } from '@angular/forms';
import {
  CONFIGURATION_KEYS,
  FORM_VALIDATION_PATTERNS,
  GST_NUMBER_LENGTH,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import { IContractorAddFormDto } from '../../types/contractor.dto';

const ADD_CONTRACTOR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IContractorAddFormDto> =
  {
    contractorName: {
      id: 'contractorName',
      fieldName: 'contractorName',
      label: 'Contractor Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    contactNumber: {
      id: 'contactNumber',
      fieldName: 'contactNumber',
      label: 'Contact Number',
      fieldType: EDataType.TEXT,
      textConfig: {
        regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
        minimumInputLength: 10,
        maximumInputLength: 10,
      },
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ],
    },
    emailAddress: {
      id: 'emailAddress',
      fieldName: 'emailAddress',
      label: 'Email Address',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.LOWERCASE,
      },
      validators: [
        Validators.required,
        Validators.pattern(FORM_VALIDATION_PATTERNS.EMAIL),
      ],
    },
    contractorGSTNumber: {
      id: 'contractorGSTNumber',
      fieldName: 'contractorGSTNumber',
      label: 'Contractor GST Number',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        minimumInputLength: GST_NUMBER_LENGTH,
        maximumInputLength: GST_NUMBER_LENGTH,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
      },
    },
    blockNumber: {
      id: 'blockNumber',
      fieldName: 'blockNumber',
      label: 'Block Number',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.UPPERCASE,
      },
    },
    streetName: {
      id: 'streetName',
      fieldName: 'streetName',
      label: 'Street Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
    },
    landmark: {
      id: 'landmark',
      fieldName: 'landmark',
      label: 'Landmark',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
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
  };

const ADD_CONTRACTOR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Contractor',
    tooltip: 'Add a new contractor',
  },
};

export const ADD_CONTRACTOR_FORM_CONFIG: IFormConfig<IContractorAddFormDto> = {
  fields: ADD_CONTRACTOR_FORM_FIELDS_CONFIG,
  buttons: ADD_CONTRACTOR_FORM_BUTTONS_CONFIG,
};
