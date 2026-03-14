import { Validators } from '@angular/forms';
import { IAttendanceApplyFormDto } from '@features/attendance-management/types/attendance.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import {
  EButtonActionType,
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPLY_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAttendanceApplyFormDto> =
  {
    notes: {
      fieldType: EDataType.TEXT_AREA,
      id: 'notes',
      fieldName: 'notes',
      label: 'Notes (optional)',
      placeholder: 'e.g. I am going to work',
    },
    locationName: {
      fieldType: EDataType.SELECT,
      id: 'locationName',
      fieldName: 'locationName',
      label: 'Location',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY,
          dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        },
      },
      // validators: [Validators.required],
    },
    clientName: {
      fieldType: EDataType.SELECT,
      id: 'clientName',
      fieldName: 'clientName',
      label: 'Client',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONTRACTOR,
          dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        },
      },
      // validators: [Validators.required],
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
          resetOnFalse: false,
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
    type: 'submit',
  },
  checkOut: {
    id: EButtonActionType.CHECK_OUT,
    label: 'Check Out',
    icon: ICONS.ATTENDANCE.CHECK_OUT,
    type: 'submit',
  },
};

export const APPLY_ATTENDANCE_FORM_CONFIG: IFormConfig<IAttendanceApplyFormDto> =
  {
    fields: APPLY_ATTENDANCE_FORM_FIELDS_CONFIG,
    buttons: APPLY_ATTENDANCE_FORM_BUTTONS_CONFIG,
  };
