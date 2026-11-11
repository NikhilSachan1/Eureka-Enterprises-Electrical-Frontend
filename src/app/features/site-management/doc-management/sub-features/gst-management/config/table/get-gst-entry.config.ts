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
  getGstRevertDisableReason,
  getGstSettleDisableReason,
} from '@features/site-management/doc-management/shared/utils/tax-register-status.util';
import { IGstEntryGetBaseResponseDto } from '../../types/gst.dto';

export const GST_ENTRY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No GST register entry found.',
};

export const GST_ENTRY_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
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
      customTemplateKey: 'gstDocumentReference',
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
      customTemplateKey: 'gstAmountBreakdown',
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
      header: 'Portal verification',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'settlementStatusLabel',
      header: 'Held GST',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
  ];

const buildGstEntryTableRowActionsConfig = (): Partial<
  ITableActionConfig<IGstEntryGetBaseResponseDto>
>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View GST entry details',
    permission: [APP_PERMISSION.GST.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Verify on GST portal (GSTR-2B / GSTR-1)',
    disableWhen: (row: IGstEntryGetBaseResponseDto) => row.isVerified,
    disableReason: (row: IGstEntryGetBaseResponseDto) =>
      row.isVerified ? 'This entry is already verified.' : undefined,
    permission: [APP_PERMISSION.GST.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Revert verification',
    disableWhen: (row: IGstEntryGetBaseResponseDto) =>
      !!getGstRevertDisableReason(row),
    disableReason: (row: IGstEntryGetBaseResponseDto) =>
      getGstRevertDisableReason(row),
    permission: [APP_PERMISSION.GST.REJECT],
  },
  {
    id: EButtonActionType.PAID,
    tooltip: 'Settle held GST (release to vendor / mark received)',
    permission: [APP_PERMISSION.GST.RELEASE],
    disableWhen: (row: IGstEntryGetBaseResponseDto) =>
      !!getGstSettleDisableReason(row),
    disableReason: (row: IGstEntryGetBaseResponseDto) =>
      getGstSettleDisableReason(row),
  },
];

const buildGstEntryTableBulkActionsConfig = (): Partial<
  ITableActionConfig<IGstEntryGetBaseResponseDto>
>[] => [
  {
    id: EButtonActionType.PAID,
    label: 'Settle Held GST',
    tooltip:
      'Release held GST to the vendor / mark it received from the client',
    permission: [APP_PERMISSION.GST.RELEASE],
    disableWhen: (row: IGstEntryGetBaseResponseDto) =>
      !!getGstSettleDisableReason(row),
    disableReason: (row: IGstEntryGetBaseResponseDto): string | undefined => {
      const reason = getGstSettleDisableReason(row);
      return reason
        ? `Some selected entries cannot be settled: ${reason}`
        : undefined;
    },
  },
];

export function createGstEntryTableEnhancedConfig(): IEnhancedTableConfig<IGstEntryGetBaseResponseDto> {
  return {
    tableConfig: GST_ENTRY_TABLE_CONFIG,
    headers: GST_ENTRY_TABLE_HEADERS_CONFIG,
    rowActions: buildGstEntryTableRowActionsConfig(),
    bulkActions: buildGstEntryTableBulkActionsConfig(),
  };
}
