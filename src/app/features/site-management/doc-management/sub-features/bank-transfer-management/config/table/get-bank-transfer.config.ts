import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IBankTransfer } from '../../types/bank-transfer.interface';

export const BANK_TRANSFER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No bank transfer record found.',
};

export const BANK_TRANSFER_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
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
      customTemplateKey: 'bankTransferDocumentReference',
      showSort: false,
    },
    {
      field: 'transferDate',
      header: 'Transfer Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'utrNumber',
      header: 'UTR / Ref.',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'transferAmount',
      header: 'Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.CURRENCY,
      showSort: false,
    },
    {
      field: 'transferProofAttachmentKeys',
      header: 'Proof of transfer',
      bodyTemplate: EDataType.ATTACHMENTS,
      showSort: false,
    },
  ];

const BANK_TRANSFER_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IBankTransfer>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View bank transfer details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit bank transfer',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete bank transfer',
  },
];

export const BANK_TRANSFER_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IBankTransfer> =
  {
    tableConfig: BANK_TRANSFER_TABLE_CONFIG,
    headers: BANK_TRANSFER_TABLE_HEADERS_CONFIG,
    rowActions: BANK_TRANSFER_TABLE_ROW_ACTIONS_CONFIG,
  };
