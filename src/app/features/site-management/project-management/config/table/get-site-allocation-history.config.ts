import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import { ISiteAllocationHistory } from '../../types/site-allocation.interface';

export const SITE_ALLOCATION_HISTORY_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No allocation history found.',
  showCheckbox: false,
};

export const SITE_ALLOCATION_HISTORY_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'docWorkspaceContext',
      header: 'Workspace overview',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
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
      field: 'allocationPeriod',
      header: 'Period',
      bodyTemplate: EDataType.RANGE,
      dataType: EDataType.DATE,
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
      showSort: false,
    },
    {
      field: 'allocationStatus',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
  ];

export const SITE_ALLOCATION_HISTORY_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<ISiteAllocationHistory> =
  {
    tableConfig: SITE_ALLOCATION_HISTORY_TABLE_CONFIG,
    headers: SITE_ALLOCATION_HISTORY_TABLE_HEADER_CONFIG,
  };
