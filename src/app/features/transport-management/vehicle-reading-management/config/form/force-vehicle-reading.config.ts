import { Validators } from '@angular/forms';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IVehicleReadingForceUIFormDto } from '../../types/vehicle-reading.dto';
import { ADD_VEHICLE_READING_FORM_CONFIG } from './add-vehicle-reading.config';

const FORCE_VEHICLE_READING_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVehicleReadingForceUIFormDto> =
  {
    employeeName: {
      fieldType: EDataType.SELECT,
      id: 'employeeName',
      fieldName: 'employeeName',
      label: 'Employee Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
      },
      validators: [Validators.required],
    },
    ...ADD_VEHICLE_READING_FORM_CONFIG.fields,
  };

const FORCE_VEHICLE_READING_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force Vehicle Reading',
    tooltip: 'Force a vehicle reading on behalf of an employee',
  },
};

export const FORCE_VEHICLE_READING_FORM_CONFIG: IFormConfig<IVehicleReadingForceUIFormDto> =
  {
    fields: FORCE_VEHICLE_READING_FORM_FIELDS_CONFIG,
    buttons: FORCE_VEHICLE_READING_FORM_BUTTONS_CONFIG,
  };
