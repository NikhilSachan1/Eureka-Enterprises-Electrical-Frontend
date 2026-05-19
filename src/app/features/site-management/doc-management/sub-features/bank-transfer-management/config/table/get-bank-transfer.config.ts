import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IBankTransfer } from '../../types/bank-transfer.interface';

export const BANK_TRANSFER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No bank transfer record found.',
};

export const createBankTransferTableHeadersConfig = (
  isPurchase: boolean
): Partial<IDataTableHeaderConfig>[] => [
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
  {
    field: 'paymentAdviceReferenceNumber',
    header: 'Payment Advice',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
    showColumn: isPurchase,
  },
  {
    field: 'paymentAdvicePdfKeys',
    header: 'PA Attachment',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
    showColumn: isPurchase,
  },
];

const buildBankTransferTableRowActionsConfig = (
  isPurchase: boolean
): Partial<ITableActionConfig<IBankTransfer>>[] => [
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
  {
    id: EButtonActionType.SEND_EMAIL,
    tooltip: 'Mail Payment Advice',
    hideWhen: () => !isPurchase,
  },
];

export const getBankTransferTableConfig = (
  docContext: EDocContext
): IEnhancedTableConfig<IBankTransfer> =>
  ((): IEnhancedTableConfig<IBankTransfer> => {
    const isPurchase = docContext === EDocContext.PURCHASE;
    return {
      tableConfig: BANK_TRANSFER_TABLE_CONFIG,
      headers: createBankTransferTableHeadersConfig(isPurchase),
      rowActions: buildBankTransferTableRowActionsConfig(isPurchase),
    };
  })();
