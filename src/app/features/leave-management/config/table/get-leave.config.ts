import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/models';
import {
  ETableBodyTemplate,
  ETableDataType,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import {
  COMMON_BULK_ACTIONS,
  COMMON_ROW_ACTIONS,
  MATCH_MODE_OPTIONS,
} from '@shared/config';
import { ILeaveGetResponseDto } from '../../types/leave.dto';
import { getDataFromArrayOfObjects } from '@shared/utility';
import { APPROVAL_STATUS_DATA } from '@shared/config/static-data.config';
import { APP_CONFIG } from '@core/config';
import { DatePipe } from '@angular/common';

export const LEAVE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: ['employeeName', 'fromDate', 'toDate', 'approvalStatus'],
  emptyMessage: 'No leave found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any leave yet. Please add a leave first.",
};

export const LEAVE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'employeeCode',
      showImage: true,
      dummyImageField: 'employeeName',
      primaryFieldHighlight: true,
    },
    filterConfig: {
      filterField: 'employeeId',
      placeholder: 'Search Employee Name',
    },
  },
  {
    field: 'fromDate',
    header: 'Leave Duration',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    dataType: ETableDataType.DATE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'fromDate',
      primaryFieldLabel: 'From',
      secondaryFieldLabel: 'To',
      dataType: ETableDataType.DATE,
    },
    filterConfig: {
      filterField: 'fromDate',
      placeholder: 'Search By Leave Duration',
      matchModeOptions: MATCH_MODE_OPTIONS.date,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'reason',
    header: 'Reason',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'reason',
      placeholder: 'Search By Leave Reason',
    },
    showSort: false,
  },
  {
    field: 'approvalStatus',
    header: 'Approval Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'approvalStatus',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: getDataFromArrayOfObjects(
        APPROVAL_STATUS_DATA,
        'label'
      ),
      placeholder: 'Search By Approval Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: false,
  },
];

export const LEAVE_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Leave Details',
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Leave',
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Leave',
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Cancel Leave',
  },
];

export const LEAVE_TABLE_BULK_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Selected Leave',
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject Selected Leave',
  },
  {
    ...COMMON_BULK_ACTIONS.CANCEL,
    tooltip: 'Cancel Selected Leave',
  },
];

export const LEAVE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<ILeaveGetResponseDto> =
  {
    tableConfig: LEAVE_TABLE_CONFIG,
    headers: LEAVE_TABLE_HEADER_CONFIG,
    rowActions: LEAVE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: LEAVE_TABLE_BULK_ACTIONS_CONFIG,
  };

export const LEAVE_TABLE_STATE_MAPPING = {
  employeeName: {
    sortField: 'fullName',
  },
  fromDate: {
    sortField: 'fromDate',
  },
  employeeId: {
    filterField: 'userIds',
  },
  leaveDuration: {
    filterField: 'leaveDuration',
    distribute: {
      startDate: 'startDate',
      endDate: 'endDate',
    },
    transform: (value: unknown): { startDate?: string; endDate?: string } => {
      const [startDateObj, endDateObj] = value as Date[];
      const datePipe = new DatePipe('en-US');
      const dateFormat = APP_CONFIG.DATE_FORMATS.API; // Use format from constant

      return {
        startDate: startDateObj
          ? (datePipe.transform(startDateObj, dateFormat) ?? undefined)
          : undefined,
        endDate: endDateObj
          ? (datePipe.transform(endDateObj, dateFormat) ?? undefined)
          : undefined,
      };
    },
  },
  approvalStatus: {
    filterField: 'approvalStatuses',
  },
};
