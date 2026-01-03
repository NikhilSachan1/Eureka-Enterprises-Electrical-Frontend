import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES, REGEX } from '@shared/constants';
import {
  EDataType,
  EDateSelectionMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ADD_VEHICLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  registrationNo: {
    fieldType: EDataType.TEXT,
    id: 'registrationNo',
    fieldName: 'registrationNo',
    label: 'Registration Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
    validators: [
      Validators.required,
      Validators.pattern(REGEX.ALPHANUMERIC),
      Validators.maxLength(10),
      Validators.minLength(10),
    ],
  },
  vehicleBrand: {
    fieldType: EDataType.TEXT,
    id: 'vehicleBrand',
    fieldName: 'vehicleBrand',
    label: 'Brand',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [Validators.required],
  },
  vehicleModel: {
    fieldType: EDataType.TEXT,
    id: 'vehicleModel',
    fieldName: 'vehicleModel',
    label: 'Model',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
  },
  mileage: {
    fieldType: EDataType.TEXT,
    id: 'mileage',
    fieldName: 'mileage',
    label: 'Mileage',
    validators: [Validators.required],
  },
  fuelType: {
    fieldType: EDataType.SELECT,
    id: 'fuelType',
    fieldName: 'fuelType',
    label: 'Fuel Type',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.FUEL_TYPE_LIST,
      },
    },
    validators: [Validators.required],
  },
  vehiclePurchaseDate: {
    fieldType: EDataType.DATE,
    id: 'vehiclePurchaseDate',
    fieldName: 'vehiclePurchaseDate',
    label: 'Vehicle Purchase Date',
    dateConfig: {
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  dealerName: {
    fieldType: EDataType.TEXT,
    id: 'dealerName',
    fieldName: 'dealerName',
    label: 'Dealer Name',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
  },
  insurancePeriod: {
    fieldType: EDataType.DATE,
    id: 'insurancePeriod',
    fieldName: 'insurancePeriod',
    label: 'Insurance Period',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
  },
  pucPeriod: {
    fieldType: EDataType.DATE,
    id: 'pucPeriod',
    fieldName: 'pucPeriod',
    label: 'PUC Period',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
  },
  fitnessPeriod: {
    fieldType: EDataType.DATE,
    id: 'fitnessPeriod',
    fieldName: 'fitnessPeriod',
    label: 'Fitness Period',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
  },
  vehicleDocuments: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'vehicleDocuments',
    fieldName: 'vehicleDocuments',
    label: 'Vehicle Documents & Images',
    fileConfig: {
      fileLimit: 10,
      acceptFileTypes: [
        ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
        ...APP_CONFIG.MEDIA_CONFIG.PDF,
      ],
    },
    validators: [Validators.required],
  },
  remarks: {
    fieldType: EDataType.TEXT_AREA,
    id: 'remarks',
    fieldName: 'remarks',
    label: 'Remarks',
  },
};

const ADD_VEHICLE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Vehicle',
    tooltip: 'Add a new vehicle',
  },
};

export const ADD_VEHICLE_FORM_CONFIG: IFormConfig = {
  fields: ADD_VEHICLE_FORM_FIELDS_CONFIG,
  buttons: ADD_VEHICLE_FORM_BUTTONS_CONFIG,
};
