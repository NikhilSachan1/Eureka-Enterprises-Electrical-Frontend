import { APP_PERMISSION } from '@core/constants';
import { IAttendanceGetFormDto } from '@features/attendance-management/types/attendance.dto';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EApprovalStatus,
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IAttendanceGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    permission: [APP_PERMISSION.UI.ATTENDANCE.SEARCH_FILTER_EMPLOYEE_NAME],
  },
  attendanceDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Attendance Date',
    fieldName: 'attendanceDate',
  },
  attendanceStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'attendanceStatus',
    fieldName: 'attendanceStatus',
    label: 'Attendance Status',
    multiSelectConfig: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ATTENDANCE,
        dropdownName: CONFIGURATION_KEYS.ATTENDANCE.STATUS,
      },
      filterOptions: {
        exclude: [EAttendanceStatus.CHECKED_OUT],
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  approvalStatus: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
    multiSelectConfig: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
      filterOptions: {
        exclude: [
          ...(COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus
            .multiSelectConfig.filterOptions?.exclude ?? []),
          EApprovalStatus.CANCELLED,
        ],
      },
    },
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_ATTENDANCE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_ATTENDANCE_FORM_CONFIG: ITableSearchFilterFormConfig<IAttendanceGetFormDto> =
  {
    fields: SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_ATTENDANCE_FORM_BUTTONS_CONFIG,
  };
