import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  IExpenseGetBaseResponseDto,
  IExpenseGetResponseDto,
} from '@features/expense-management/types/expense.dto';
import { disableExpenseWhenNotPendingApproval } from '@features/expense-management/utils';
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
  isNotRecordCreator,
  isRecordCreator,
  recordCreatorBulkDisableReason,
  recordCreatorDisableReason,
} from '@shared/utility';

export const EXPENSE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No expense record found.',
};

export const EXPENSE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'employeeCode' },
    showImage: true,
    dummyImageField: 'employeeName',
    primaryFieldHighlight: true,
    permission: [APP_PERMISSION.UI.EXPENSE.TABLE_EMPLOYEE_NAME],
    serverSideFilterAndSortConfig: {
      sortField: 'userName',
      filterField: 'employeeName',
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
    serverSideFilterAndSortConfig: {
      sortField: 'category',
      filterField: 'expenseType',
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

export function buildExpenseTableRowActionsConfig(
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IExpenseGetResponseDto['records'][number]>>[] {
  return [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Expense Details',
      permission: [APP_PERMISSION.EXPENSE.VIEW_DETAIL],
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit Expense',
      permission: [APP_PERMISSION.EXPENSE.EDIT],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        isNotRecordCreator(row.createdBy, loggedInUserId) ||
        disableExpenseWhenNotPendingApproval(row),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        recordCreatorDisableReason('expense', row.createdBy, loggedInUserId) ??
        (disableExpenseWhenNotPendingApproval(row)
          ? 'Expense is not in pending approval.'
          : undefined),
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete Expense',
      permission: [APP_PERMISSION.EXPENSE.DELETE],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        isNotRecordCreator(row.createdBy, loggedInUserId) ||
        disableExpenseWhenNotPendingApproval(row),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        recordCreatorDisableReason('expense', row.createdBy, loggedInUserId) ??
        (disableExpenseWhenNotPendingApproval(row)
          ? 'Expense is not in pending approval.'
          : undefined),
    },
    {
      ...COMMON_ROW_ACTIONS.APPROVE,
      tooltip: 'Approve Expense',
      permission: [APP_PERMISSION.EXPENSE.APPROVE],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.APPROVED ||
        isRecordCreator(row.createdBy, loggedInUserId),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.APPROVED
          ? 'Expense is already approved.'
          : isRecordCreator(row.createdBy, loggedInUserId)
            ? 'You cannot approve your own added expense.'
            : undefined,
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject Expense',
      permission: [APP_PERMISSION.EXPENSE.REJECT],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.REJECTED ||
        isRecordCreator(row.createdBy, loggedInUserId),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.REJECTED
          ? 'Expense is already rejected.'
          : isRecordCreator(row.createdBy, loggedInUserId)
            ? 'You cannot reject your own added expense.'
            : undefined,
    },
  ];
}

export function buildExpenseTableBulkActionsConfig(
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IExpenseGetResponseDto['records'][number]>>[] {
  return [
    {
      ...COMMON_BULK_ACTIONS.DELETE,
      tooltip: 'Delete Selected Expense',
      permission: [APP_PERMISSION.EXPENSE.DELETE],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        isNotRecordCreator(row.createdBy, loggedInUserId) ||
        disableExpenseWhenNotPendingApproval(row),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        recordCreatorBulkDisableReason(
          'expenses',
          row.createdBy,
          loggedInUserId
        ) ??
        (disableExpenseWhenNotPendingApproval(row)
          ? 'Some of the selected expenses are not in pending approval.'
          : undefined),
    },
    {
      ...COMMON_BULK_ACTIONS.APPROVE,
      tooltip: 'Approve Selected Expense',
      permission: [APP_PERMISSION.EXPENSE.APPROVE],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.APPROVED ||
        isRecordCreator(row.createdBy, loggedInUserId),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.APPROVED
          ? 'Some of the selected expenses are already approved.'
          : isRecordCreator(row.createdBy, loggedInUserId)
            ? 'You cannot approve your own added expenses.'
            : undefined,
    },
    {
      ...COMMON_BULK_ACTIONS.REJECT,
      tooltip: 'Reject Selected Expense',
      permission: [APP_PERMISSION.EXPENSE.REJECT],
      disableWhen: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.REJECTED ||
        isRecordCreator(row.createdBy, loggedInUserId),
      disableReason: (row: IExpenseGetBaseResponseDto) =>
        row.approvalStatus.toLowerCase() === EApprovalStatus.REJECTED
          ? 'Some of the selected expenses are already rejected.'
          : isRecordCreator(row.createdBy, loggedInUserId)
            ? 'You cannot reject your own added expenses.'
            : undefined,
    },
  ];
}

export function createExpenseTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IExpenseGetResponseDto['records'][number]> {
  return {
    tableConfig: EXPENSE_TABLE_CONFIG,
    headers: EXPENSE_TABLE_HEADER_CONFIG,
    rowActions: buildExpenseTableRowActionsConfig(loggedInUserId),
    bulkActions: buildExpenseTableBulkActionsConfig(loggedInUserId),
  };
}
