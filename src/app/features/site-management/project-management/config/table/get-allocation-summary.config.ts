import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  IPageHeaderConfig,
  ITableActionConfig,
} from '@shared/types';
import {
  IEmployeeAllocationSummaryRow,
  IProjectAllocationSummaryRow,
} from '../../types/site-allocation.interface';

const SUMMARY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: false,
};

/** Header row of a summary tab: no title, just the tab's filter on the right. */
export const ALLOCATION_SUMMARY_FILTER_HEADER_CONFIG: IPageHeaderConfig = {
  title: '',
  subtitle: '',
  showHeaderButton: false,
  showHeaderFilter: true,
  showGoBackButton: false,
  showNotificationBell: false,
};

// ── Employee wise ────────────────────────────────────────────────

const EMPLOYEE_WISE_HEADERS: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'user.fullName',
    header: 'Employee',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'user.employeeId' },
    showImage: true,
    dummyImageField: 'user.fullName',
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'statusLabel',
    header: 'Status',
    bodyTemplate: EDataType.STATUS,
    showSort: false,
  },
  {
    field: 'allocatedDays',
    header: 'Allocation',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'allocation',
    showSort: false,
  },
];

const EMPLOYEE_WISE_ROW_ACTIONS: Partial<
  ITableActionConfig<IEmployeeAllocationSummaryRow>
>[] = [
  {
    id: EButtonActionType.EVENT_HISTORY,
    tooltip: 'View journey across projects',
    icon: ICONS.COMMON.HISTORY,
  },
];

export const EMPLOYEE_WISE_ALLOCATION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IEmployeeAllocationSummaryRow> =
  {
    tableConfig: {
      ...SUMMARY_TABLE_CONFIG,
      emptyMessage: 'No employees found.',
    },
    headers: EMPLOYEE_WISE_HEADERS,
    rowActions: EMPLOYEE_WISE_ROW_ACTIONS,
  };

// ── Project wise ─────────────────────────────────────────────────

const PROJECT_WISE_HEADERS: Partial<IDataTableHeaderConfig>[] = [
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
    field: 'currentPeople',
    header: 'People',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'people',
    showSort: false,
  },
];

const PROJECT_WISE_ROW_ACTIONS: Partial<
  ITableActionConfig<IProjectAllocationSummaryRow>
>[] = [
  {
    id: EButtonActionType.EVENT_HISTORY,
    tooltip: 'View who worked on this project',
    icon: ICONS.COMMON.HISTORY,
  },
];

export const PROJECT_WISE_ALLOCATION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IProjectAllocationSummaryRow> =
  {
    tableConfig: {
      ...SUMMARY_TABLE_CONFIG,
      emptyMessage: 'No projects found.',
    },
    headers: PROJECT_WISE_HEADERS,
    rowActions: PROJECT_WISE_ROW_ACTIONS,
  };
