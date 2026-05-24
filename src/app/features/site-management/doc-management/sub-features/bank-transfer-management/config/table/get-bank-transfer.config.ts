import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import {
  isNotRecordCreator,
  recordCreatorDisableReason,
} from '@shared/utility';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IBankTransferGetBaseResponseDto } from '../../types/bank-transfer.dto';

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
  isPurchase: boolean,
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IBankTransferGetBaseResponseDto>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View bank transfer details',
    permission: [APP_PERMISSION.BANK_TRANSFER_DOC.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit bank transfer',
    disableWhen: (row: IBankTransferGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId),
    disableReason: (row: IBankTransferGetBaseResponseDto) =>
      recordCreatorDisableReason(
        'bank transfer',
        row.createdBy,
        loggedInUserId
      ),
    permission: [APP_PERMISSION.BANK_TRANSFER_DOC.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete bank transfer',
    disableWhen: (row: IBankTransferGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId),
    disableReason: (row: IBankTransferGetBaseResponseDto) =>
      recordCreatorDisableReason(
        'bank transfer',
        row.createdBy,
        loggedInUserId
      ),
    permission: [APP_PERMISSION.BANK_TRANSFER_DOC.DELETE],
  },
  {
    id: EButtonActionType.SEND_EMAIL,
    tooltip: 'Mail Payment Advice',
    hideWhen: () => !isPurchase,
    permission: [APP_PERMISSION.BANK_TRANSFER_DOC.SEND_EMAIL],
  },
];

export const getBankTransferTableConfig = (
  docContext: EDocContext,
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IBankTransferGetBaseResponseDto> =>
  ((): IEnhancedTableConfig<IBankTransferGetBaseResponseDto> => {
    const isPurchase = docContext === EDocContext.PURCHASE;
    return {
      tableConfig: BANK_TRANSFER_TABLE_CONFIG,
      headers: createBankTransferTableHeadersConfig(isPurchase),
      rowActions: buildBankTransferTableRowActionsConfig(
        isPurchase,
        loggedInUserId
      ),
    };
  })();
