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
  getGstVerifyPortalName,
} from '@features/site-management/doc-management/shared/utils/tax-register-status.util';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
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

/** Settle wording per side: we release vendor GST, the client pays contractor GST to us. */
const SETTLE_TOOLTIP: Record<EDocContext, string> = {
  [EDocContext.PURCHASE]: 'Book the held GST release to the vendor',
  [EDocContext.SALES]: 'Mark the held GST received from the client',
};

const buildGstEntryTableRowActionsConfig = (
  side: EDocContext | null
): Partial<ITableActionConfig<IGstEntryGetBaseResponseDto>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View GST entry details',
    permission: [APP_PERMISSION.GST.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: side
      ? `Verify in ${getGstVerifyPortalName(side)}`
      : 'Verify on GST portal (GSTR-2B / GSTR-1)',
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
    tooltip: side
      ? SETTLE_TOOLTIP[side]
      : 'Settle held GST (book release to vendor / mark received)',
    permission: [APP_PERMISSION.GST.RELEASE],
    disableWhen: (row: IGstEntryGetBaseResponseDto) =>
      !!getGstSettleDisableReason(row),
    disableReason: (row: IGstEntryGetBaseResponseDto) =>
      getGstSettleDisableReason(row),
  },
];

const buildGstEntryTableBulkActionsConfig = (
  side: EDocContext | null
): Partial<ITableActionConfig<IGstEntryGetBaseResponseDto>>[] => [
  {
    id: EButtonActionType.PAID,
    label: 'Settle Held GST',
    tooltip: side
      ? SETTLE_TOOLTIP[side]
      : 'Book the held GST release to the vendor / mark it received from the client',
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

/** GST register for one side; verification is named after the side's return. */
export function createGstEntryTableEnhancedConfig(
  side: EDocContext | null
): IEnhancedTableConfig<IGstEntryGetBaseResponseDto> {
  const headers = GST_ENTRY_TABLE_HEADERS_CONFIG.map(header =>
    side && header.field === 'verificationStatusLabel'
      ? { ...header, header: getGstVerifyPortalName(side) }
      : header
  );

  return {
    tableConfig: GST_ENTRY_TABLE_CONFIG,
    headers,
    rowActions: buildGstEntryTableRowActionsConfig(side),
    bulkActions: buildGstEntryTableBulkActionsConfig(side),
  };
}
