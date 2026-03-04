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
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Expense',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Expense',
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Expense',
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Expense',
  },
];

export const VEHICLE_READING_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IExpenseGetResponseDto['records'][number]
> = {
  tableConfig: VEHICLE_READING_TABLE_CONFIG,
  headers: VEHICLE_READING_TABLE_HEADER_CONFIG,
  rowActions: VEHICLE_READING_TABLE_ROW_ACTIONS_CONFIG,
};
