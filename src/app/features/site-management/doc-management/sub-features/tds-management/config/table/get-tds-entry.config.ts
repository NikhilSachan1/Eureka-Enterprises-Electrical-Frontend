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
  getTdsVerifyPortalName,
} from '@features/site-management/doc-management/shared/utils/tax-register-status.util';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
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

const buildTdsEntryTableRowActionsConfig = (
  side: EDocContext | null
): Partial<ITableActionConfig<ITdsEntryGetBaseResponseDto>>[] => [
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
    tooltip: side
      ? `Verify in ${getTdsVerifyPortalName(side)}`
      : 'Verify in 26Q (vendor) / Form 26AS (contractor)',
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
  {
    id: EButtonActionType.REVERT_CHALLAN,
    tooltip: 'Revert TDS challan',
    disableWhen: (row: ITdsEntryGetBaseResponseDto) =>
      !!getTdsRevertChallanDisableReason(row),
    disableReason: getTdsRevertChallanDisableReason,
    permission: [APP_PERMISSION.TDS.REVERT_CHALLAN],
  },
];

/** A challan can be reverted only once its 26Q verification is undone (26Q needs the challan). */
function getTdsRevertChallanDisableReason(
  row: ITdsEntryGetBaseResponseDto
): string | undefined {
  if (!row.tdsPaymentId) {
    return 'No challan is recorded for this entry.';
  }
  if (row.isVerified) {
    return 'Revert the 26Q verification first.';
  }
  return undefined;
}

const buildTdsEntryTableBulkActionsConfig = (): Partial<
  ITableActionConfig<ITdsEntryGetBaseResponseDto>
>[] => [
  {
    id: EButtonActionType.PAID,
    label: 'Record Challan',
    tooltip: 'Record one TDS challan for the selected entries',
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

/**
 * TDS register for one side. Contractor TDS is deposited by the client, so that side has no
 * deposit column and no challan actions; verification is named after the side's portal.
 */
export function createTdsEntryTableEnhancedConfig(
  side: EDocContext | null
): IEnhancedTableConfig<ITdsEntryGetBaseResponseDto> {
  const isSales = side === EDocContext.SALES;
  const headers = TDS_ENTRY_TABLE_HEADERS_CONFIG.filter(
    header => !(isSales && header.field === 'depositStatusLabel')
  ).map(header =>
    side && header.field === 'verificationStatusLabel'
      ? { ...header, header: getTdsVerifyPortalName(side) }
      : header
  );

  return {
    tableConfig: TDS_ENTRY_TABLE_CONFIG,
    headers,
    // Contractor TDS is deposited by the client: no challan to record or revert.
    rowActions: buildTdsEntryTableRowActionsConfig(side).filter(
      action =>
        !(
          isSales &&
          (action.id === EButtonActionType.PAID ||
            action.id === EButtonActionType.REVERT_CHALLAN)
        )
    ),
    bulkActions: isSales ? [] : buildTdsEntryTableBulkActionsConfig(),
  };
}
