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
import { IvehicleAddFormDto } from '../../types/vehicle.dto';

const ADD_VEHICLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IvehicleAddFormDto> =
  {
    vehicleRegistrationNo: {
      fieldType: EDataType.TEXT,
      id: 'vehicleRegistrationNo',
      fieldName: 'vehicleRegistrationNo',
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
    vehicleMileage: {
      fieldType: EDataType.TEXT,
      id: 'vehicleMileage',
      fieldName: 'vehicleMileage',
      label: 'Mileage',
      validators: [Validators.required],
    },
    vehicleFuelType: {
      fieldType: EDataType.SELECT,
      id: 'vehicleFuelType',
      fieldName: 'vehicleFuelType',
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
    vehicleDealerName: {
      fieldType: EDataType.TEXT,
      id: 'vehicleDealerName',
      fieldName: 'vehicleDealerName',
      label: 'Dealer Name',
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
    },
    vehicleInsuranceDate: {
      fieldType: EDataType.DATE,
      id: 'vehicleInsuranceDate',
      fieldName: 'vehicleInsuranceDate',
      label: 'Insurance Period',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
      },
    },
    vehiclePUCDate: {
      fieldType: EDataType.DATE,
      id: 'vehiclePUCDate',
      fieldName: 'vehiclePUCDate',
      label: 'PUC Period',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
      },
    },
    vehicleFitnessDate: {
      fieldType: EDataType.DATE,
      id: 'vehicleFitnessDate',
      fieldName: 'vehicleFitnessDate',
      label: 'Fitness Period',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
      },
    },
    vehicleFiles: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'vehicleFiles',
      fieldName: 'vehicleFiles',
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

export const ADD_VEHICLE_FORM_CONFIG: IFormConfig<IvehicleAddFormDto> = {
  fields: ADD_VEHICLE_FORM_FIELDS_CONFIG,
  buttons: ADD_VEHICLE_FORM_BUTTONS_CONFIG,
};
