import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
  EDataType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ILeaveGetResponseDto } from '../../types/leave.dto';
import { APP_CONFIG } from '@core/config';

export const LEAVE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No leave record found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any leave yet. Please add a leave first.",
};

export const LEAVE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'employeeCode',
      showImage: true,
      dummyImageField: 'employeeName',
      primaryFieldHighlight: true,
    },
    serverSideFilterAndSortConfig: {
      sortField: 'fullName',
      filterField: 'employeeName',
    },
  },
  {
    field: 'leaveDate',
    header: 'Leave Date',
    bodyTemplate: EDataType.DATE_RANGE,
    dataType: EDataType.DATE_RANGE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    serverSideFilterAndSortConfig: {
      sortField: 'fromDate',
      filterField: 'leaveDate',
    },
  },
  {
    field: 'reason',
    header: 'Reason',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'approvalStatus',
    header: 'Approval Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'approvalStatus',
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
    tooltip: 'Approve Attendance',
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Attendance',
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Cancel Leave',
  },
];

export const LEAVE_TABLE_BULK_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Selected Attendance',
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject Selected Attendance',
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
