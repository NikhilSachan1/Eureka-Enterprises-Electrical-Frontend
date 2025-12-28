import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import {
  EButtonActionType,
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPLY_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  locationName: {
    fieldType: EDataType.SELECT,
    id: 'locationName',
    fieldName: 'locationName',
    label: 'Location',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.SITE,
        dropdownName: CONFIGURATION_KEYS.SITE.LOCATION_LIST,
      },
    },
    validators: [Validators.required],
  },
  clientName: {
    fieldType: EDataType.SELECT,
    id: 'clientName',
    fieldName: 'clientName',
    label: 'Client',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.SITE,
        dropdownName: CONFIGURATION_KEYS.SITE.CLIENT_LIST,
      },
    },
    validators: [Validators.required],
  },
  associateEngineerName: {
    fieldType: EDataType.SELECT,
    id: 'associateEngineerName',
    fieldName: 'associateEngineerName',
    label: 'Associate Engineer',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
      },
    },
    validators: [],
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          const { isDriver } = context;
          return isDriver === true;
        },
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
  },
  associatedVehicle: {
    fieldType: EDataType.SELECT,
    id: 'associatedVehicle',
    fieldName: 'associatedVehicle',
    label: 'Associated Vehicle',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
      },
    },
  },
};

const APPLY_ATTENDANCE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  checkIn: {
    id: EButtonActionType.CHECK_IN,
    label: 'Check In',
    icon: ICONS.ATTENDANCE.CHECK_IN,
  },
  checkOut: {
    id: EButtonActionType.CHECK_OUT,
    label: 'Check Out',
    icon: ICONS.ATTENDANCE.CHECK_OUT,
  },
};

export const APPLY_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: APPLY_ATTENDANCE_FORM_FIELDS_CONFIG,
  buttons: APPLY_ATTENDANCE_FORM_BUTTONS_CONFIG,
};
