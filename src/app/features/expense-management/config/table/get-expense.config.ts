import { APP_CONFIG } from '@core/config';
import { IExpenseGetResponseDto } from '@features/expense-management/types/expense.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const EXPENSE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No expense record found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any expense record yet. Please add a expense record first.",
};

export const EXPENSE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
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
      sortField: 'userName',
      filterField: 'userIds',
    },
  },
  {
    field: 'expenseDate',
    header: 'Expense Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    serverSideFilterAndSortConfig: {
      sortField: 'expenseDate',
      filterField: 'expenseDate',
    },
  },
  {
    field: 'expenseType',
    header: 'Expense Type',
    bodyTemplate: EDataType.TEXT,
    dataType: EDataType.TEXT,
    serverSideFilterAndSortConfig: {
      sortField: 'category',
      filterField: 'categories',
    },
    showSort: false,
  },
  {
    field: 'expenseAmount',
    header: 'Amount',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
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
      filterField: 'approvalStatuses',
    },
    showSort: false,
  },
];

export const EXPENSE_TABLE_ROW_ACTIONS_CONFIG: Partial<
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

export const EXPENSE_TABLE_BULK_ACTIONS_CONFIG: Partial<ITableActionConfig>[] =
  [
    {
      ...COMMON_BULK_ACTIONS.DELETE,
      tooltip: 'Delete Selected Expense',
    },
    {
      ...COMMON_BULK_ACTIONS.APPROVE,
      tooltip: 'Approve Selected Expense',
    },
    {
      ...COMMON_BULK_ACTIONS.REJECT,
      tooltip: 'Reject Selected Expense',
    },
  ];

export const EXPENSE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IExpenseGetResponseDto['records'][number]
> = {
  tableConfig: EXPENSE_TABLE_CONFIG,
  headers: EXPENSE_TABLE_HEADER_CONFIG,
  rowActions: EXPENSE_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: EXPENSE_TABLE_BULK_ACTIONS_CONFIG,
};
