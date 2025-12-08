import { APP_CONFIG } from '@core/config';
import { IExpenseGetResponseDto } from '@features/expense-management/types/expense.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  ETableBodyTemplate,
  ETableDataType,
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
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
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
    bodyTemplate: ETableBodyTemplate.DATE,
    dataType: ETableDataType.DATE,
    serverSideFilterAndSortConfig: {
      sortField: 'expenseDate',
      filterField: 'expenseDate',
    },
  },
  {
    field: 'expenseType',
    header: 'Expense Type',
    bodyTemplate: ETableBodyTemplate.TEXT,
    dataType: ETableDataType.TEXT,
    serverSideFilterAndSortConfig: {
      sortField: 'category',
      filterField: 'categories',
    },
    showSort: false,
  },
  {
    field: 'expenseAmount',
    header: 'Amount',
    bodyTemplate: ETableBodyTemplate.CURRENCY,
    dataType: ETableDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    showSort: false,
  },
  {
    field: 'fileKeys',
    header: 'Attachments',
    bodyTemplate: ETableBodyTemplate.FILE_LINK,
    showSort: false,
  },
  {
    field: 'approvalStatus',
    header: 'Approval Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'approvalStatuses',
    },
    showSort: false,
  },
];

export const EXPENSE_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Expense Details',
  },
  {
    id: EButtonActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
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

export const EXPENSE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IExpenseGetResponseDto> =
  {
    tableConfig: EXPENSE_TABLE_CONFIG,
    headers: EXPENSE_TABLE_HEADER_CONFIG,
    rowActions: EXPENSE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: EXPENSE_TABLE_BULK_ACTIONS_CONFIG,
  };
