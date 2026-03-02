import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IvehicleServiceAddFormDto } from '../../types/vehicle-service.dto';

const ADD_VEHICLE_SERVICE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IvehicleServiceAddFormDto> =
  {
    vehicleName: {
      fieldType: EDataType.SELECT,
      id: 'vehicleName',
      fieldName: 'vehicleName',
      label: 'Vehicle Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
        },
      },
      validators: [Validators.required],
    },
    serviceDate: {
      fieldType: EDataType.DATE,
      id: 'serviceDate',
      fieldName: 'serviceDate',
      label: 'Service Date',
      dateConfig: {
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    odometerReading: {
      fieldType: EDataType.NUMBER,
      id: 'odometerReading',
      fieldName: 'odometerReading',
      label: 'Odometer Reading',
      numberConfig: {
        mode: EInputNumberMode.Decimal,
      },
      validators: [Validators.required],
    },
    serviceType: {
      fieldType: EDataType.SELECT,
      id: 'serviceType',
      fieldName: 'serviceType',
      label: 'Service Type',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.SERVICE_TYPE_LIST,
        },
      },
      validators: [Validators.required],
    },
    serviceAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'serviceAttachments',
      fieldName: 'serviceAttachments',
      label: 'Service Attachments',
      fileConfig: {
        fileLimit: 5,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    serviceCenterName: {
      fieldType: EDataType.TEXT,
      id: 'serviceCenterName',
      fieldName: 'serviceCenterName',
      label: 'Service Center Name',
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    serviceCost: {
      fieldType: EDataType.NUMBER,
      id: 'serviceCost',
      fieldName: 'serviceCost',
      label: 'Service Cost',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
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

const ADD_VEHICLE_SERVICE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Vehicle Service',
    tooltip: 'Add a new vehicle service',
  },
};

export const ADD_VEHICLE_SERVICE_FORM_CONFIG: IFormConfig<IvehicleServiceAddFormDto> =
  {
    fields: ADD_VEHICLE_SERVICE_FORM_FIELDS_CONFIG,
    buttons: ADD_VEHICLE_SERVICE_FORM_BUTTONS_CONFIG,
  };
