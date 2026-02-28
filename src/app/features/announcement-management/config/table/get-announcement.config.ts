import { APP_CONFIG } from '@core/config';
import { IAnnouncementGetResponseDto } from '@features/announcement-management/types/announcement.dto';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';

const ANNOUNCEMENT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No announcement record found.',
  emptyMessageDescription:
    "You don't have any announcement record yet. Please add a announcement record first.",
};

const ANNOUNCEMENT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'title',
    header: 'Title',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    icon: ICONS.COMMON.MEGAPHONE,
    dummyImageField: 'title',
    showSort: false,
  },
  {
    field: 'announcementDuration',
    header: 'Announcement Duration',
    bodyTemplate: EDataType.DATE_RANGE,
    dataType: EDataType.DATE_RANGE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    serverSideFilterAndSortConfig: {
      sortField: 'startAt',
      filterField: 'announcementDuration',
    },
  },
  {
    field: 'announcementStatus',
    header: 'Announcement Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'announcementStatus',
    },
    showSort: false,
  },
  {
    field: 'acknowledgmentStats',
    header: 'Acknowledged / Total',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
];

const ANNOUNCEMENT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAnnouncementGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Announcement',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Announcement',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Announcement',
  },
];

const ANNOUNCEMENT_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAnnouncementGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Announcement',
  },
];

export const ANNOUNCEMENT_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IAnnouncementGetResponseDto['records'][number]
> = {
  tableConfig: ANNOUNCEMENT_TABLE_CONFIG,
  headers: ANNOUNCEMENT_TABLE_HEADER_CONFIG,
  rowActions: ANNOUNCEMENT_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: ANNOUNCEMENT_TABLE_BULK_ACTIONS_CONFIG,
};
