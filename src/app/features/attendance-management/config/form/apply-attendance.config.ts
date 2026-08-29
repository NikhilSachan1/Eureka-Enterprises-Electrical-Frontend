import { Validators } from '@angular/forms';
import { IAttendanceApplyUIFormDto } from '@features/attendance-management/types/attendance.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  CONFIGURATION_KEYS,
  EUserRole,
  MODULE_NAMES,
} from '@shared/constants';
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
      validators: [Validators.required],
    },
    contractor: {
      fieldType: EDataType.SELECT,
      id: 'contractor',
      fieldName: 'contractor',
      label: 'Contractor',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONTRACTOR,
          dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        },
      },
      validators: [Validators.required],
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
          filterByRole: [EUserRole.EMPLOYEE],
          employeeStatusFilter: ['ACTIVE'],
        },
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { isDriver, isAssignmentApplicable = true } = context;
            return isDriver === true && isAssignmentApplicable === true;
          },
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    assignedDriver: {
      fieldType: EDataType.SELECT,
      id: 'assignedDriver',
      fieldName: 'assignedDriver',
      label: 'Assigned Driver',
      selectConfig: {
        showClearButton: true,
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          filterByRole: [EUserRole.DRIVER],
          employeeStatusFilter: ['ACTIVE'],
        },
      },
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
