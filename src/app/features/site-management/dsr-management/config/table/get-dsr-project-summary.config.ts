import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IDsrProjectSummaryRow } from '../../types/dsr-summary.interface';

const DSR_PROJECT_WISE_HEADERS: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'docWorkspaceContext',
    header: 'Project',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'docWorkspaceContext',
    showSort: false,
  },
  {
    field: 'statusLabel',
    header: 'Status',
    bodyTemplate: EDataType.STATUS,
    showSort: false,
  },
  {
    field: 'reportedDays',
    header: 'Reporting',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'reporting',
    showSort: false,
  },
  {
    field: 'lastReportDate',
    header: 'Last DSR',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'lastReport',
    showSort: false,
  },
];

const DSR_PROJECT_WISE_ROW_ACTIONS: Partial<
  ITableActionConfig<IDsrProjectSummaryRow>
>[] = [
  {
    id: EButtonActionType.EVENT_HISTORY,
    tooltip: 'View DSR timeline',
    icon: ICONS.COMMON.HISTORY,
  },
];

export const DSR_PROJECT_WISE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IDsrProjectSummaryRow> =
  {
    tableConfig: {
      showCheckbox: false,
      emptyMessage: 'No projects found.',
    },
    headers: DSR_PROJECT_WISE_HEADERS,
    rowActions: DSR_PROJECT_WISE_ROW_ACTIONS,
  };
