import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  getTdsChallanDisableReason,
  getTdsVerifyDisableReason,
} from '@features/site-management/doc-management/shared/utils/tax-register-status.util';
import { ITdsEntryGetBaseResponseDto } from '../../types/tds.dto';

export const TDS_ENTRY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No TDS register entry found.',
};

export const TDS_ENTRY_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'docWorkspaceContext',
      header: 'Workspace overview',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
    {
      field: 'documentReferenceHierarchy',
      header: 'Document reference',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'tdsDocumentReference',
      showSort: false,
    },
    {
      field: 'invoiceDate',
      header: 'Invoice date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'taxableAmount',
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'tdsAmountBreakdown',
      showSort: false,
    },
    {
      field: 'verifyFileKeys',
      header: 'Attachment',
      bodyTemplate: EDataType.ATTACHMENTS,
      showSort: false,
    },
    {
      field: 'depositStatusLabel',
      header: 'Deposit',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'verificationStatusLabel',
      header: '26Q / 26AS',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
  ];

const buildTdsEntryTableRowActionsConfig = (): Partial<
  ITableActionConfig<ITdsEntryGetBaseResponseDto>
>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View TDS entry details',
    permission: [APP_PERMISSION.TDS.VIEW_DETAIL],
  },
  {
    id: EButtonActionType.PAID,
    tooltip: 'Record TDS challan',
    permission: [APP_PERMISSION.TDS.RELEASE],
    disableWhen: (row: ITdsEntryGetBaseResponseDto) =>
      !!getTdsChallanDisableReason(row),
    disableReason: (row: ITdsEntryGetBaseResponseDto) =>
      getTdsChallanDisableReason(row),
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Verify in 26Q (vendor) / Form 26AS (contractor)',
    disableWhen: (row: ITdsEntryGetBaseResponseDto) =>
      !!getTdsVerifyDisableReason(row),
    disableReason: (row: ITdsEntryGetBaseResponseDto) =>
      getTdsVerifyDisableReason(row),
    permission: [APP_PERMISSION.TDS.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Revert verification',
    disableWhen: (row: ITdsEntryGetBaseResponseDto) => !row.isVerified,
    disableReason: (row: ITdsEntryGetBaseResponseDto) =>
      !row.isVerified ? 'Only verified entries can be reverted.' : undefined,
    permission: [APP_PERMISSION.TDS.REJECT],
  },
];

const buildTdsEntryTableBulkActionsConfig = (): Partial<
  ITableActionConfig<ITdsEntryGetBaseResponseDto>
>[] => [
  {
    id: EButtonActionType.PAID,
    label: 'Record Challan',
    tooltip: 'Record one TDS challan for the selected vendor entries',
    permission: [APP_PERMISSION.TDS.RELEASE],
    disableWhen: (row: ITdsEntryGetBaseResponseDto) =>
      !!getTdsChallanDisableReason(row),
    disableReason: (row: ITdsEntryGetBaseResponseDto): string | undefined => {
      const reason = getTdsChallanDisableReason(row);
      return reason
        ? `Some selected entries cannot be added: ${reason}`
        : undefined;
    },
  },
];

export function createTdsEntryTableEnhancedConfig(): IEnhancedTableConfig<ITdsEntryGetBaseResponseDto> {
  return {
    tableConfig: TDS_ENTRY_TABLE_CONFIG,
    headers: TDS_ENTRY_TABLE_HEADERS_CONFIG,
    rowActions: buildTdsEntryTableRowActionsConfig(),
    bulkActions: buildTdsEntryTableBulkActionsConfig(),
  };
}
