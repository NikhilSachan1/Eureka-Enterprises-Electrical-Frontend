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
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import { IVendorAddFormDto } from '../../types/vendor.dto';
import { EVendorType } from '../../types/vendor.enum';

const ADD_VENDOR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVendorAddFormDto> =
  {
    vendorType: {
      id: 'vendorType',
      fieldName: 'vendorType',
      label: 'Vendor Type',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VENDOR,
          dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_TYPES,
        },
      },
      validators: [Validators.required],
    },
    vendorName: {
      id: 'vendorName',
      fieldName: 'vendorName',
      label: 'Vendor Name',
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
        minimumInputLength: 10,
        maximumInputLength: 10,
        regex: TEXT_INPUT_ACCEPT_STRIP.DIGITS,
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
    },
    vendorGSTNumber: {
      id: 'vendorGSTNumber',
      fieldName: 'vendorGSTNumber',
      label: 'Vendor GST Number',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        minimumInputLength: 15,
        maximumInputLength: 15,
      },
      conditionalValidators: [
        {
          dependsOn: 'vendorType',
          shouldApply: (vendorType: string) =>
            vendorType !== EVendorType.FREELANCER,
          validators: [
            Validators.required,
            Validators.minLength(15),
            Validators.maxLength(15),
          ],
          resetOnFalse: true,
        },
      ],
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

const ADD_VENDOR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Vendor',
    tooltip: 'Add a new vendor',
  },
};

export const ADD_VENDOR_FORM_CONFIG: IFormConfig<IVendorAddFormDto> = {
  fields: ADD_VENDOR_FORM_FIELDS_CONFIG,
  buttons: ADD_VENDOR_FORM_BUTTONS_CONFIG,
};
