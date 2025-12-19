import { Validators } from '@angular/forms';
import {
  CLIENT_NAME_DATA,
  EMPLOYEE_NAME_DATA,
  LOCATION_DATA,
  VEHICLE_LIST_DATA,
} from '@shared/config/static-data.config';
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
      optionsDropdown: LOCATION_DATA,
    },
    validators: [Validators.required],
  },
  clientName: {
    fieldType: EDataType.SELECT,
    id: 'clientName',
    fieldName: 'clientName',
    label: 'Client',
    selectConfig: {
      optionsDropdown: CLIENT_NAME_DATA,
    },
    validators: [Validators.required],
  },
  associateEngineerName: {
    fieldType: EDataType.SELECT,
    id: 'associateEngineerName',
    fieldName: 'associateEngineerName',
    label: 'Associate Engineer',
    selectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    validators: [Validators.required],
  },
  associatedVehicle: {
    fieldType: EDataType.SELECT,
    id: 'associatedVehicle',
    fieldName: 'associatedVehicle',
    label: 'Associated Vehicle',
    selectConfig: {
      optionsDropdown: VEHICLE_LIST_DATA,
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

export const getApplyAttendanceFormConfig = (
  isDriver: boolean
): IFormConfig => {
  const baseAssociateEmployeeConfig =
    APPLY_ATTENDANCE_FORM_FIELDS_CONFIG['associateEngineerName'];

  const fields: IFormInputFieldsConfig = {
    ...APPLY_ATTENDANCE_FORM_FIELDS_CONFIG,
    associateEmployeeName: isDriver
      ? {
          ...baseAssociateEmployeeConfig,
        }
      : {
          ...baseAssociateEmployeeConfig,
          validators: [],
        },
  };

  return {
    fields,
    buttons: APPLY_ATTENDANCE_FORM_BUTTONS_CONFIG,
  };
};
