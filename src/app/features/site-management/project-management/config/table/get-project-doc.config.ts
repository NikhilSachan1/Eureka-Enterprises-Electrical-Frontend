import { COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

export const PROJECT_DOC_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No documents found.',
  emptyMessageDescription: 'Add documents to get started.',
  emptyMessageIcon: ICONS.COMMON.FILE,
  showCheckbox: false,
  enableServerSide: false,
};

export const PROJECT_DOC_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'documentNumber',
      header: 'Document Number',
      bodyTemplate: EDataType.TEXT,
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'documentType',
      header: 'Type',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'documentDate',
      header: 'Document Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
    },
    {
      field: 'amount',
      header: 'Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.CURRENCY,
    },
    {
      field: 'status',
      header: 'Status',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'documentKeys',
      header: 'Attachments',
      bodyTemplate: EDataType.ATTACHMENTS,
      showSort: false,
      showFilter: false,
    },
    {
      field: 'remarks',
      header: 'Remarks',
      bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
      showSort: false,
      showFilter: false,
    },
  ];

export const PROJECT_DOC_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] =
  [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Document',
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit Document',
    },
    {
      id: EButtonActionType.DOWNLOAD,
      tooltip: 'Download',
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete Document',
    },
  ];

export const PROJECT_DOC_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig = {
  tableConfig: PROJECT_DOC_TABLE_CONFIG,
  headers: PROJECT_DOC_TABLE_HEADER_CONFIG,
  rowActions: PROJECT_DOC_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: [],
};
