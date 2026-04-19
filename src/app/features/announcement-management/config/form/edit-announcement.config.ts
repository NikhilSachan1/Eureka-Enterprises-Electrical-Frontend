import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IAnnouncementEditFormDto } from '@features/announcement-management/types/announcement.dto';
import { ADD_ANNOUNCEMENT_FORM_CONFIG } from './add-announcement.config';

const EDIT_ANNOUNCEMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAnnouncementEditFormDto> =
  {
    ...ADD_ANNOUNCEMENT_FORM_CONFIG.fields,
  };

const EDIT_ANNOUNCEMENT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Announcement',
    tooltip: 'Update announcement',
  },
};

export const EDIT_ANNOUNCEMENT_FORM_CONFIG: IFormConfig<IAnnouncementEditFormDto> =
  {
    fields: EDIT_ANNOUNCEMENT_FORM_FIELDS_CONFIG,
    buttons: EDIT_ANNOUNCEMENT_FORM_BUTTONS_CONFIG,
  };
