import { Validators } from '@angular/forms';
import { IAttendanceApplyUIFormDto } from '@features/attendance-management/types/attendance.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import {
  EButtonActionType,
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPLY_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAttendanceApplyUIFormDto> =
  {
    company: {
      fieldType: EDataType.SELECT,
      id: 'company',
      fieldName: 'company',
      label: 'Company',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY,
          dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        },
      },
    },
    contractors: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'contractors',
      fieldName: 'contractors',
      label: 'Contractors',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONTRACTOR,
          dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        },
      },
    },
    assignedEngineer: {
      fieldType: EDataType.SELECT,
      id: 'assignedEngineer',
      fieldName: 'assignedEngineer',
      label: 'Assigned Engineer',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
      },
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
    vehicle: {
      fieldType: EDataType.SELECT,
      id: 'vehicle',
      fieldName: 'vehicle',
      label: 'Vehicle',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
        },
      },
    },
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Note',
    },
  };

const APPLY_ATTENDANCE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  checkIn: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    id: EButtonActionType.CHECK_IN,
    label: 'Check In',
    icon: ICONS.ATTENDANCE.CHECK_IN,
  },
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
};

export const APPLY_ATTENDANCE_FORM_CONFIG: IFormConfig<IAttendanceApplyUIFormDto> =
  {
    fields: APPLY_ATTENDANCE_FORM_FIELDS_CONFIG,
    buttons: APPLY_ATTENDANCE_FORM_BUTTONS_CONFIG,
  };
