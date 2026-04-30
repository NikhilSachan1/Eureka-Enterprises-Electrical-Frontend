import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IDocGetResponseDto } from '../../types/doc.dto';
import { APP_CONFIG } from '@core/config';

export const DOC_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No Doc record found.',
};

export const DOC_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'contractorName',
    header: 'Contractor Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'contractorName',
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'documentType',
    header: 'Document Type',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'documentNumber',
    header: 'Document Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'referenceDocument',
    header: 'Reference Document',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    dummyImageField: 'referenceDocumentName',
    primaryFieldHighlight: true,
    subtitle: { field: 'referenceDocumentNumber' },
    showSort: false,
  },
  {
    field: 'documentDate',
    header: 'Document Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
  {
    field: 'amount',
    header: 'Amount',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    customTemplateKey: 'amountBreakdown',
    showSort: false,
  },
  {
    field: 'remarks',
    header: 'Notes',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'documentAttachments',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
  {
    field: 'status',
    header: 'Approval Status',
    bodyTemplate: EDataType.STATUS,
    showSort: false,
  },
];

type DocRow = Record<string, unknown>;
type DocStatus = 'pending' | 'approved' | 'rejected' | 'unlock_requested';

const status = (row: DocRow): DocStatus => row['status'] as DocStatus;
const isLocked = (row: DocRow): boolean =>
  status(row) === 'approved' || status(row) === 'unlock_requested';

export const DOC_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IDocGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Doc Details',
    permission: [APP_PERMISSION.PROJECT.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Doc',
    permission: [APP_PERMISSION.PROJECT.EDIT],
    disableWhen: row => isLocked(row as DocRow),
    disableReason: row =>
      isLocked(row as DocRow) ? 'Locked documents cannot be edited' : undefined,
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Doc',
    permission: [APP_PERMISSION.PROJECT.DELETE],
    disableWhen: row => isLocked(row as DocRow),
    disableReason: row =>
      isLocked(row as DocRow)
        ? 'Locked documents cannot be deleted'
        : undefined,
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve / Confirm Unlock',
    disableWhen: row => status(row as DocRow) === 'approved',
    disableReason: row =>
      status(row as DocRow) === 'approved' ? 'Already approved' : undefined,
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Doc',
    disableWhen: row => status(row as DocRow) === 'rejected',
    disableReason: row =>
      status(row as DocRow) === 'rejected' ? 'Already rejected' : undefined,
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Request Unlock',
    disableWhen: row => status(row as DocRow) !== 'approved',
    disableReason: row =>
      status(row as DocRow) !== 'approved'
        ? 'Only approved documents can request unlock'
        : undefined,
  },
];

export const DOC_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IDocGetResponseDto['records'][number]
> = {
  tableConfig: DOC_TABLE_CONFIG,
  headers: DOC_TABLE_HEADER_CONFIG,
  rowActions: DOC_TABLE_ROW_ACTIONS_CONFIG,
};
