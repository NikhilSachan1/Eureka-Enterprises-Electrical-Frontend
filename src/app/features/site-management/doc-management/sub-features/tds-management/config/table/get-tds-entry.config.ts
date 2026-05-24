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
      field: 'paymentDate',
      header: 'Payment date',
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
      field: 'verificationStatusLabel',
      header: 'Verification',
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
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve TDS entry',
    disableWhen: (row: ITdsEntryGetBaseResponseDto) => row.isVerified,
    disableReason: (row: ITdsEntryGetBaseResponseDto) =>
      row.isVerified ? 'This entry is already approved.' : undefined,
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
  {
    id: EButtonActionType.PAID,
    tooltip: 'Release payment',
    permission: [APP_PERMISSION.TDS.RELEASE],
    disableWhen: (row: ITdsEntryGetBaseResponseDto) =>
      !row.isVerified || !!row.tdsPaymentId,
    disableReason: (row: ITdsEntryGetBaseResponseDto): string | undefined => {
      if (!row.isVerified) {
        return 'This entry is not verified yet.';
      }
      if (row.tdsPaymentId) {
        return 'Payment already released for this entry.';
      }
      return undefined;
    },
  },
];

const buildTdsEntryTableBulkActionsConfig = (): Partial<
  ITableActionConfig<ITdsEntryGetBaseResponseDto>
>[] => [
  {
    id: EButtonActionType.PAID,
    label: 'Release Payment',
    tooltip: 'Release payment for selected entries',
    permission: [APP_PERMISSION.TDS.RELEASE],
    disableWhen: (row: ITdsEntryGetBaseResponseDto) =>
      !row.isVerified || !!row.tdsPaymentId,
    disableReason: (row: ITdsEntryGetBaseResponseDto): string | undefined => {
      if (!row.isVerified) {
        return 'Some selected entries are not verified yet.';
      }
      if (row.tdsPaymentId) {
        return 'Some selected entries already have payment released.';
      }
      return undefined;
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
