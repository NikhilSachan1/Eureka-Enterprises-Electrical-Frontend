import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { editorRequiredValidator } from '@shared/utility/validators.util';
import {
  EDataType,
  EDateSelectionMode,
  EEditorToolbarOption,
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
      fieldType: EDataType.EDITOR,
      id: 'content',
      fieldName: 'content',
      label: 'Content',
      placeholder: 'Write your announcement content here',
      editorConfig: {
        height: '320px',
        toolbarFilter: {
          include: [
            EEditorToolbarOption.HEADER,
            EEditorToolbarOption.FONT,
            EEditorToolbarOption.SIZE,
            EEditorToolbarOption.LIST,
            EEditorToolbarOption.ALIGNMENT,
            EEditorToolbarOption.BOLD,
            EEditorToolbarOption.ITALIC,
            EEditorToolbarOption.LINK,
            EEditorToolbarOption.COLOR,
            EEditorToolbarOption.BACKGROUND,
          ],
        },
      },
      validators: [editorRequiredValidator()],
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
          employeeStatusFilter: ['ACTIVE'],
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
