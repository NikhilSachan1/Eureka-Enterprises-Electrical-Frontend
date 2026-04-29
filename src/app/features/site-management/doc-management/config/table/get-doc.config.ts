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
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Doc',
    permission: [APP_PERMISSION.PROJECT.DELETE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Doc',
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Doc',
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Cancel Doc',
  },
];

export const DOC_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IDocGetResponseDto['records'][number]
> = {
  tableConfig: DOC_TABLE_CONFIG,
  headers: DOC_TABLE_HEADER_CONFIG,
  rowActions: DOC_TABLE_ROW_ACTIONS_CONFIG,
};
