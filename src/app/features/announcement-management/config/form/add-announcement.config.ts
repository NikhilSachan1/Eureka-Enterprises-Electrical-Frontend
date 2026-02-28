import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EDateSelectionMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAnnouncementAddFormDto } from '@features/announcement-management/types/announcement.dto';
import { FinancialYearService } from '@core/services/financial-year.service';

const ADD_ANNOUNCEMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAnnouncementAddFormDto> =
  {
    title: {
      fieldType: EDataType.TEXT,
      id: 'title',
      fieldName: 'title',
      label: 'Title',
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    content: {
      fieldType: EDataType.TEXT_AREA,
      id: 'content',
      fieldName: 'content',
      label: 'Content',
      validators: [Validators.required],
    },
    announcementDate: {
      fieldType: EDataType.DATE,
      id: 'announcementDate',
      fieldName: 'announcementDate',
      label: 'Announcement Period',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
        minDate: new Date(),
        maxDate: new FinancialYearService().getFinancialYearEndDate(),
      },
      validators: [Validators.required],
    },
    announcementSentTo: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'announcementSentTo',
      fieldName: 'announcementSentTo',
      label: 'Announcement Sent To',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
      },
      validators: [Validators.required],
    },
  };

const ADD_ANNOUNCEMENT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Announcement',
    tooltip: 'Add a new announcement',
  },
};

export const ADD_ANNOUNCEMENT_FORM_CONFIG: IFormConfig<IAnnouncementAddFormDto> =
  {
    fields: ADD_ANNOUNCEMENT_FORM_FIELDS_CONFIG,
    buttons: ADD_ANNOUNCEMENT_FORM_BUTTONS_CONFIG,
  };
