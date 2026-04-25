import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { ILeaveGetFormDto } from '@features/leave-management/types/leave.dto';
import { APP_PERMISSION } from '@core/constants';

const SEARCH_FILTER_LEAVE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  ILeaveGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    multiSelectConfig: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig,
      dynamicDropdown: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig
          .dynamicDropdown,
        archivedHandling: 'enabled',
      },
    },
    permission: [APP_PERMISSION.UI.LEAVE.SEARCH_FILTER_EMPLOYEE_NAME],
  },
  leaveDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Leave Date',
    fieldName: 'leaveDate',
  },
  approvalStatus: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_LEAVE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_LEAVE_FORM_CONFIG: ITableSearchFilterFormConfig<ILeaveGetFormDto> =
  {
    fields: SEARCH_FILTER_LEAVE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_LEAVE_FORM_BUTTONS_CONFIG,
  };
