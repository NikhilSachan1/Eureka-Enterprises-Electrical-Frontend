import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '../../types/fuel-expense-outstanding.dto';

export const FUEL_EXPENSE_OUTSTANDING_TABLE_CONFIG: Partial<IDataTableConfig> =
  {
    emptyMessage: 'No fuel outstanding record found.',
    emptyMessageDescription:
      'There are no pending fuel reimbursements to be paid.',
    showCheckbox: true,
  };

export const FUEL_EXPENSE_OUTSTANDING_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
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

export function createFuelExpenseOutstandingTableEnhancedConfig(): IEnhancedTableConfig<IFuelExpenseOutstandingGetBaseResponseDto> {
  return {
    tableConfig: FUEL_EXPENSE_OUTSTANDING_TABLE_CONFIG,
    headers: FUEL_EXPENSE_OUTSTANDING_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
}
