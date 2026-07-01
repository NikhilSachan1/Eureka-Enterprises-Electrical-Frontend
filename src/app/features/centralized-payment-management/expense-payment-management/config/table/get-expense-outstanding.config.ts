import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IExpenseOutstandingGetBaseResponseDto } from '../../types/expense-outstanding.dto';

export const EXPENSE_OUTSTANDING_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No expense outstanding record found.',
  emptyMessageDescription:
    'There are no pending expense reimbursements to be paid.',
};

export const EXPENSE_OUTSTANDING_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'employeeName',
      header: 'Employee Name',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'employeeCode' },
      showImage: true,
      dummyImageField: 'employeeName',
      primaryFieldHighlight: true,
      serverSideFilterAndSortConfig: {
        sortField: 'userName',
        filterField: 'employeeName',
      },
    },
    {
      field: 'pendingAmount',
      header: 'Pending Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.NUMBER,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      serverSideFilterAndSortConfig: {
        sortField: 'pendingAmount',
      },
      showSort: false,
    },
  ];

export function createExpenseOutstandingTableEnhancedConfig(): IEnhancedTableConfig<IExpenseOutstandingGetBaseResponseDto> {
  return {
    tableConfig: EXPENSE_OUTSTANDING_TABLE_CONFIG,
    headers: EXPENSE_OUTSTANDING_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
}
