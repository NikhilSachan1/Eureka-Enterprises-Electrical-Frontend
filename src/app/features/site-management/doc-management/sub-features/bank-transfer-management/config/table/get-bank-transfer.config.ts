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

export const createBankTransferTableHeadersConfig = (
  docContext: EDocContext
): Partial<IDataTableHeaderConfig>[] => {
  const isPurchase = docContext === EDocContext.PURCHASE;
  const isSales = docContext === EDocContext.SALES;

  return [
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
      header: isSales ? 'Received Date' : 'Transfer Date',
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
      header: isPurchase ? 'Amount' : 'Amounts',
      bodyTemplate: isPurchase ? EDataType.CURRENCY : EDataType.TEXT,
      dataType: isPurchase ? EDataType.CURRENCY : undefined,
      customTemplateKey: isPurchase ? undefined : 'bankTransferAmountBreakdown',
      showSort: false,
    },
    {
      field: 'transferProofAttachmentKeys',
      header: isSales ? 'Proof of receipt' : 'Proof of transfer',
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
};

const buildBankTransferTableRowActionsConfig = (
  docContext: EDocContext,
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IBankTransferGetBaseResponseDto>>[] => {
  const isPurchase = docContext === EDocContext.PURCHASE;
  const isSales = docContext === EDocContext.SALES;
  const entityLabel = isSales ? 'bank received' : 'bank transfer';

  return [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: isSales
        ? 'View bank received details'
        : 'View bank transfer details',
      permission: [APP_PERMISSION.BANK_TRANSFER_DOC.VIEW_DETAIL],
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: isSales ? 'Edit bank received' : 'Edit bank transfer',
      disableWhen: (row: IBankTransferGetBaseResponseDto) =>
        isNotRecordCreator(row.createdBy, loggedInUserId),
      disableReason: (row: IBankTransferGetBaseResponseDto) =>
        recordCreatorDisableReason(entityLabel, row.createdBy, loggedInUserId),
      permission: [APP_PERMISSION.BANK_TRANSFER_DOC.EDIT],
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: isSales ? 'Delete bank received' : 'Delete bank transfer',
      disableWhen: (row: IBankTransferGetBaseResponseDto) =>
        isNotRecordCreator(row.createdBy, loggedInUserId),
      disableReason: (row: IBankTransferGetBaseResponseDto) =>
        recordCreatorDisableReason(entityLabel, row.createdBy, loggedInUserId),
      permission: [APP_PERMISSION.BANK_TRANSFER_DOC.DELETE],
    },
    {
      id: EButtonActionType.SEND_EMAIL,
      tooltip: 'Mail Payment Advice',
      hideWhen: () => !isPurchase,
      permission: [APP_PERMISSION.BANK_TRANSFER_DOC.SEND_EMAIL],
    },
  ];
};

export const getBankTransferTableConfig = (
  docContext: EDocContext,
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IBankTransferGetBaseResponseDto> => {
  const isSales = docContext === EDocContext.SALES;

  return {
    tableConfig: {
      emptyMessage: isSales
        ? 'No bank received record found.'
        : 'No bank transfer record found.',
    } satisfies Partial<IDataTableConfig>,
    headers: createBankTransferTableHeadersConfig(docContext),
    rowActions: buildBankTransferTableRowActionsConfig(
      docContext,
      loggedInUserId
    ),
  };
};
