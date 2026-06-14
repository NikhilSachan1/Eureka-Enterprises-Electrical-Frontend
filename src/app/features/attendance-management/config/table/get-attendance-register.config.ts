import { ICONS } from '@shared/constants';
import { IEnhancedTableConfig, IDataTableConfig } from '@shared/types';

const ATTENDANCE_REGISTER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  tableUniqueId: 'id',
  rowHover: true,
  showPaginator: false,
  showCheckbox: false,
  enableServerSide: false,
  scrollable: true,
  scrollHeight: 'calc(100vh - 14rem)',
  tableStyleClass: 'attendance-register-data-table',
  emptyMessage: 'No attendance register data found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
};

export const ATTENDANCE_REGISTER_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig = {
  tableConfig: ATTENDANCE_REGISTER_TABLE_CONFIG,
  headers: [],
  bulkActions: [],
  rowActions: [],
};
