import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  ECalendarView,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IGeneratePayrollFormDto } from '@features/payroll-management/types/payroll.dto';
import { FinancialYearService } from '@core/services/financial-year.service';
import { getPayslipCutoffMaxDate } from '@shared/utility';
import { APP_CONFIG } from '@core/config';

const GENERATE_PAYROLL_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IGeneratePayrollFormDto> =
  {
    monthYear: {
      fieldType: EDataType.DATE,
      id: 'monthYear',
      fieldName: 'monthYear',
      label: 'Month',
      dateConfig: {
        dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_CALENDAR_MONTH_YEAR,
        minDate: new FinancialYearService().getFinancialYearStartDate(),
        maxDate: getPayslipCutoffMaxDate(),
        calendarView: ECalendarView.Month,
        touchUI: false,
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { actionType } = context;
            return actionType === undefined;
          },
          validators: [Validators.required],
        },
      ],
    },
    employeeNames: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'employeeNames',
      fieldName: 'employeeNames',
      label: 'Employee Name',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { actionType } = context;
            return actionType === undefined;
          },
          validators: [Validators.required],
        },
      ],
    },
  };

export const GENERATE_PAYROLL_FORM_CONFIG: IFormConfig<IGeneratePayrollFormDto> =
  {
    fields: GENERATE_PAYROLL_FORM_FIELDS_CONFIG,
  };
