import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IReportGetResponseDto } from '../../types/report.dto';

export const REPORT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No report record found.',
};

export const REPORT_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] = [
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
    customTemplateKey: 'documentReferenceChain',
    showSort: false,
  },
  {
    field: 'reportNumber',
    header: 'Report Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'reportDate',
    header: 'Report Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
  {
    field: 'fileKeys',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
];

const REPORT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IReportGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View report details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit report',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete report',
  },
];

export const REPORT_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IReportGetResponseDto['records'][number]
> = {
  tableConfig: REPORT_TABLE_CONFIG,
  headers: REPORT_TABLE_HEADERS_CONFIG,
  rowActions: REPORT_TABLE_ROW_ACTIONS_CONFIG,
};
