import { IAnnouncementGetFormDto } from '@features/announcement-management/types/announcement.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_ANNOUNCEMENT_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IAnnouncementGetFormDto & { globalSearch?: string }
> = {
  announcementStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'announcementStatus',
    fieldName: 'announcementStatus',
    label: 'Announcement Status',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ANNOUNCEMENT,
        dropdownName: CONFIGURATION_KEYS.ANNOUNCEMENT.ANNOUNCEMENT_STATUS,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_ANNOUNCEMENT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_ANNOUNCEMENT_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_ANNOUNCEMENT_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_ANNOUNCEMENT_FORM_BUTTONS_CONFIG,
  };
