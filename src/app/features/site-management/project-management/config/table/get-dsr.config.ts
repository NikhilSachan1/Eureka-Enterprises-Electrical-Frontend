import { COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const DSR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No DSR records found.',
  emptyMessageDescription: 'Add a new DSR to get started.',
  emptyMessageIcon: ICONS.COMMON.FILE,
  showCheckbox: false,
};

export const DSR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'createdByUser.fullName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: {
      field: 'createdByUser.employeeId',
    },
    primaryFieldHighlight: true,
    showImage: true,
    dummyImageField: 'createdByUser.fullName',
    showSort: false,
  },
  {
    field: 'reportDate',
    header: 'Status Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
  },
  {
    field: 'workTypes',
    header: 'Work Types',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'reportingEngineerName',
    header: 'Reporting Engineer',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'reportingEngineerContact' },
    icon: ICONS.COMMON.USER,
    primaryFieldHighlight: true,
    showSort: false,
    showFilter: false,
  },
  {
    field: 'documentKeys',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
    showFilter: false,
  },
  {
    field: 'remarks',
    header: 'Remarks',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
    showFilter: false,
  },
];

export const DSR_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View DSR Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit DSR',
  },
  {
    id: EButtonActionType.DELETE,
    tooltip: 'Delete DSR',
  },
];

export const DSR_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig = {
  tableConfig: DSR_TABLE_CONFIG,
  headers: DSR_TABLE_HEADER_CONFIG,
  rowActions: DSR_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: [],
};
