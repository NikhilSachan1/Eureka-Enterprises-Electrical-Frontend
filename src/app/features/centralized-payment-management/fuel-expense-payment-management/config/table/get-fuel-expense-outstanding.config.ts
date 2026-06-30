import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '../../types/fuel-expense-outstanding.dto';

export interface IFuelExpenseOutstandingTableConfigOptions {
  selectionPermissions?: string[];
}

export const FUEL_EXPENSE_OUTSTANDING_TABLE_CONFIG: Partial<IDataTableConfig> =
  {
    emptyMessage: 'No fuel outstanding record found.',
    emptyMessageDescription:
      'There are no pending fuel reimbursements to be paid.',
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

export function createFuelExpenseOutstandingTableEnhancedConfig(
  options?: IFuelExpenseOutstandingTableConfigOptions
): IEnhancedTableConfig<IFuelExpenseOutstandingGetBaseResponseDto> {
  const selectionPermissions = options?.selectionPermissions ?? [
    APP_PERMISSION.PAYMENT_SHEET.CREATE,
  ];

  return {
    tableConfig: FUEL_EXPENSE_OUTSTANDING_TABLE_CONFIG,
    headers: FUEL_EXPENSE_OUTSTANDING_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [
      {
        id: EButtonActionType.GENERATE,
        label: 'Create Payment Sheet',
        hideWhen: () => true,
        ...(selectionPermissions.length
          ? { permission: selectionPermissions }
          : {}),
      },
    ],
  };
}
