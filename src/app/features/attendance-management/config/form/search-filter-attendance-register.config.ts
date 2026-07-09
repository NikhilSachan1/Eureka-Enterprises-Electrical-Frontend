import { APP_CONFIG } from '@core/config';
import { FinancialYearService } from '@core/services/financial-year.service';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  ECalendarView,
  EDataType,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

export interface IAttendanceRegisterFilterFormDto {
  monthYear: Date;
}

const FIELDS: ITableSearchFilterInputFieldsConfig<IAttendanceRegisterFilterFormDto> =
  {
    monthYear: {
      fieldType: EDataType.DATE,
      id: 'monthYear',
      fieldName: 'monthYear',
      label: 'Month',
      dateConfig: {
        dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_CALENDAR_MONTH_YEAR,
        minDate: new FinancialYearService().getFinancialYearStartDate(),
        maxDate: new Date(),
        calendarView: ECalendarView.Month,
      },
    },
  };

export const SEARCH_FILTER_ATTENDANCE_REGISTER_FORM_CONFIG: ITableSearchFilterFormConfig<IAttendanceRegisterFilterFormDto> =
  {
    fields: FIELDS,
    buttons: {
      reset: COMMON_FORM_ACTIONS.RESET,
      submit: COMMON_FORM_ACTIONS.FILTER,
    },
  };
