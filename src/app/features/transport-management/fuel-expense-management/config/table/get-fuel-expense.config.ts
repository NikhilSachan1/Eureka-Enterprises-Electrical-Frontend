import { APP_CONFIG } from '@core/config';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EApprovalStatus,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import {
  IFuelExpenseGetBaseResponseDto,
  IFuelExpenseGetResponseDto,
} from '../../types/fuel-expense.dto';
import { ICONS } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { disableFuelExpenseWhenNotPendingApproval } from '../../utils';

export const FUEL_EXPENSE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No fuel expense record found.',
};

export const FUEL_EXPENSE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
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
      permission: [APP_PERMISSION.UI.FUEL_EXPENSE.TABLE_EMPLOYEE_NAME],
    },
    {
      field: 'fuelFillDate',
      header: 'Expense Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      serverSideFilterAndSortConfig: {
        sortField: 'fillDate',
        filterField: 'fuelFillDate',
      },
    },
    {
      field: 'vehicle.registrationNumber',
      header: 'Vehicle Name',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'vehicle.vehicleModel' },
      showImage: true,
      icon: ICONS.COMMON.CAR,
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'fuelDetails',
      header: 'Fuel Details',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'fuelDetails',
      showSort: false,
    },
    {
      field: 'fuelAmount',
      header: 'Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.NUMBER,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      showSort: false,
    },
    {
      field: 'description',
      header: 'Notes',
      bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
      showSort: false,
    },
    {
      field: 'fileKeys',
      header: 'Attachments',
      bodyTemplate: EDataType.ATTACHMENTS,
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

export const FUEL_EXPENSE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IFuelExpenseGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Fuel Expense Details',
    permission: [APP_PERMISSION.FUEL_EXPENSE.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.EDIT],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      !row.canEdit || disableFuelExpenseWhenNotPendingApproval(row),
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.DELETE],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      !row.canEdit || disableFuelExpenseWhenNotPendingApproval(row),
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.APPROVE],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      row.approvalStatus.toLowerCase() === EApprovalStatus.APPROVED,
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.REJECT],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      row.approvalStatus.toLowerCase() === EApprovalStatus.REJECTED,
  },
];

export const FUEL_EXPENSE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IFuelExpenseGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.DELETE],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      !row.canEdit || disableFuelExpenseWhenNotPendingApproval(row),
  },
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Selected Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.APPROVE],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      row.approvalStatus.toLowerCase() === EApprovalStatus.APPROVED,
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject Selected Fuel Expense',
    permission: [APP_PERMISSION.FUEL_EXPENSE.REJECT],
    disableWhen: (row: IFuelExpenseGetBaseResponseDto) =>
      row.approvalStatus.toLowerCase() === EApprovalStatus.REJECTED,
  },
];

export const FUEL_EXPENSE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IFuelExpenseGetResponseDto['records'][number]
> = {
  tableConfig: FUEL_EXPENSE_TABLE_CONFIG,
  headers: FUEL_EXPENSE_TABLE_HEADER_CONFIG,
  rowActions: FUEL_EXPENSE_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: FUEL_EXPENSE_TABLE_BULK_ACTIONS_CONFIG,
};
