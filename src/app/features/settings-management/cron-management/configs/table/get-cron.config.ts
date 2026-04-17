import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { ICronGetJobDto } from '../../types/cron.dto';

const CRON_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No cron job record found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  enableServerSide: false,
  showCheckbox: false,
  globalFilterFields: ['cronJobTitle', 'cronJobName', 'cronJobDescription'],
};

const CRON_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'cronJobTitle',
    header: 'Job',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: {
      field: 'cronJobName',
      bodyTemplate: EDataType.TEXT,
    },
    showImage: true,
    dummyImageField: 'cronJobTitle',
    primaryFieldHighlight: true,
    showSort: true,
  },
  {
    field: 'cronJobDescription',
    header: 'Description',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'requiredParameters',
    header: 'Required parameters',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'cronRequiredParameters',
    showSort: false,
  },
  {
    field: 'dependencies',
    header: 'Dependencies',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'cronDependencies',
    showSort: false,
  },
];

const CRON_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ICronGetJobDto>
>[] = [
  {
    id: EButtonActionType.GENERATE,
    tooltip: 'Trigger cron job',
  },
];

export const CRON_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<ICronGetJobDto> =
  {
    tableConfig: CRON_TABLE_CONFIG,
    headers: CRON_TABLE_HEADER_CONFIG,
    rowActions: CRON_TABLE_ROW_ACTIONS_CONFIG,
  };
