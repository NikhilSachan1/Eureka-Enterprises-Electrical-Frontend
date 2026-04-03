import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  ECalendarView,
  EDataType,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IPayslipGetFormDto } from '@features/payroll-management/types/payroll.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { APP_CONFIG } from '@core/config';
import { FinancialYearService } from '@core/services/financial-year.service';
import { getPayslipCutoffMaxDate } from '@shared/utility';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

const SEARCH_FILTER_PAYSLIP_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<IPayslipGetFormDto> =
  {
    employeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      fieldType: EDataType.SELECT,
      selectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig,
      },
      permission: [APP_PERMISSION.UI.PAYROLL.SEARCH_FILTER_EMPLOYEE_NAME],
    },
    monthYear: {
      fieldType: EDataType.DATE,
      id: 'monthYear',
      fieldName: 'monthYear',
      label: 'Month',
      dateConfig: {
        dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_CALENDAR_MONTH,
        minDate: new FinancialYearService().getFinancialYearStartDate(),
        maxDate: getPayslipCutoffMaxDate(), // Dynamic max date based on payslip generation date
        calendarView: ECalendarView.Month, // Month picker view
      },
    },
    payrollStatus: {
      fieldType: EDataType.SELECT,
      id: 'payrollStatus',
      fieldName: 'payrollStatus',
      label: 'Payroll Status',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PAYROLL,
          dropdownName: CONFIGURATION_KEYS.PAYROLL.STATUS,
        },
      },
    },
  };

const SEARCH_FILTER_PAYSLIP_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_PAYSLIP_FORM_CONFIG: ITableSearchFilterFormConfig<IPayslipGetFormDto> =
  {
    fields: SEARCH_FILTER_PAYSLIP_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_PAYSLIP_FORM_BUTTONS_CONFIG,
  };
