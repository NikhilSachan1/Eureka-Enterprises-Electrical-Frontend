import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
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
      header: 'Verification',
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
    tooltip: 'Approve GST entry',
    disableWhen: (row: IGstEntryGetBaseResponseDto) => row.isVerified,
    disableReason: (row: IGstEntryGetBaseResponseDto) =>
      row.isVerified ? 'This entry is already approved.' : undefined,
    permission: [APP_PERMISSION.GST.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Revert verification',
    disableWhen: (row: IGstEntryGetBaseResponseDto) => !row.isVerified,
    disableReason: (row: IGstEntryGetBaseResponseDto) =>
      !row.isVerified ? 'Only verified entries can be reverted.' : undefined,
    permission: [APP_PERMISSION.GST.REJECT],
  },
];

export function createGstEntryTableEnhancedConfig(): IEnhancedTableConfig<IGstEntryGetBaseResponseDto> {
  return {
    tableConfig: GST_ENTRY_TABLE_CONFIG,
    headers: GST_ENTRY_TABLE_HEADERS_CONFIG,
    rowActions: buildGstEntryTableRowActionsConfig(),
  };
}
