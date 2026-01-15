import { IPayslipGetResponseDto } from '@features/payroll-management/types/payroll.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { APP_CONFIG } from '@core/config/app.config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const PAYSLIP_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No payslip record found.',
};

export const PAYSLIP_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
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
      filterField: 'employeeName',
    },
  },
  {
    field: 'period',
    header: 'Period',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
    serverSideFilterAndSortConfig: {
      sortField: 'monthYear',
      filterField: 'monthYear',
    },
  },
  {
    field: 'attendanceDetails',
    header: 'Attendance Details',
    customTemplateKey: 'attendanceDetails',
    showSort: false,
  },
  {
    field: 'grossEarnings',
    header: 'Gross Earnings',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    showSort: false,
  },
  {
    field: 'totalDeductions',
    header: 'Total Deductions',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    showSort: false,
  },
  {
    field: 'netPayable',
    header: 'Net Payable',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    showSort: false,
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'payrollStatus',
    },
    showSort: false,
  },
  {
    field: 'viewPayslip',
    header: 'View Payslip',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
    showFilter: false,
    enableAttachmentGallery: false,
  },
];

export const PAYSLIP_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPayslipGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Payslip Details',
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Payslip',
  },
  {
    id: EButtonActionType.PAID,
    tooltip: 'Mark as Paid',
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Cancel Payslip',
  },
  {
    id: EButtonActionType.GENERATE,
    tooltip: 'Generate Payslip',
  },
];

export const PAYSLIP_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPayslipGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Payslip',
  },
  {
    id: EButtonActionType.PAID,
    tooltip: 'Mark as Paid',
    label: 'Mark as Paid',
  },
  {
    ...COMMON_BULK_ACTIONS.CANCEL,
    tooltip: 'Cancel Payslip',
  },
];

export const PAYSLIP_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IPayslipGetResponseDto['records'][number]
> = {
  tableConfig: PAYSLIP_TABLE_CONFIG,
  headers: PAYSLIP_TABLE_HEADER_CONFIG,
  rowActions: PAYSLIP_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: PAYSLIP_TABLE_BULK_ACTIONS_CONFIG,
};
