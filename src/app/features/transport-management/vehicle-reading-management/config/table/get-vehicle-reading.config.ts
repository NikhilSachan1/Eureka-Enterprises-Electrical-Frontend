import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IExpenseGetResponseDto } from '@features/expense-management/types/expense.dto';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const VEHICLE_READING_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No vehicle reading record found.',
};

export const VEHICLE_READING_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [];

export const VEHICLE_READING_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IExpenseGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Expense Details',
    permission: [APP_PERMISSION.VEHICLE_READING.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Expense',
    permission: [APP_PERMISSION.VEHICLE_READING.EDIT],
  },
];

export const VEHICLE_READING_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IExpenseGetResponseDto['records'][number]
> = {
  tableConfig: VEHICLE_READING_TABLE_CONFIG,
  headers: VEHICLE_READING_TABLE_HEADER_CONFIG,
  rowActions: VEHICLE_READING_TABLE_ROW_ACTIONS_CONFIG,
};
