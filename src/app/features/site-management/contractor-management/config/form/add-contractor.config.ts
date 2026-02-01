import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
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
      fieldType: EDataType.NUMBER,
      numberConfig: {
        allowNumberFormatting: false,
      },
      validators: [Validators.minLength(10), Validators.maxLength(10)],
    },
    emailAddress: {
      id: 'emailAddress',
      fieldName: 'emailAddress',
      label: 'Email Address',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.LOWERCASE,
      },
    },
    contractorGSTNumber: {
      id: 'contractorGSTNumber',
      fieldName: 'contractorGSTNumber',
      label: 'Contractor GST Number',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.UPPERCASE,
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
      validators: [Validators.required],
    },
    streetName: {
      id: 'streetName',
      fieldName: 'streetName',
      label: 'Street Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    landmark: {
      id: 'landmark',
      fieldName: 'landmark',
      label: 'Landmark',
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
      label: 'Pincode',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        allowNumberFormatting: false,
      },
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ],
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
