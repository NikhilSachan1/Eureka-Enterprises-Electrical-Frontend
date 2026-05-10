import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';

const SEARCH_FILTER_PROJECT_WORKSPACE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<IProjectWorkspaceSearchFilterFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
    },
    contractorName: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'contractorName',
      fieldName: 'contractorName',
      label: 'Contractor Name',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONTRACTOR,
          dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        },
      },
    },
    vendorName: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'vendorName',
      fieldName: 'vendorName',
      label: 'Vendor Name',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.CONTRACTOR,
          dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        },
      },
    },
    approvalStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'approvalStatus',
      fieldName: 'approvalStatus',
      label: 'Approval Status',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.FINANCIAL,
          dropdownName:
            CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_APPROVAL_STATUSES,
        },
      },
    },
    search: {
      fieldType: EDataType.TEXT,
      id: 'search',
      fieldName: 'search',
      label: 'Search',
    },
  };

const SEARCH_FILTER_PROJECT_WORKSPACE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_PROJECT_WORKSPACE_FORM_CONFIG: ITableSearchFilterFormConfig<IProjectWorkspaceSearchFilterFormDto> =
  {
    fields: SEARCH_FILTER_PROJECT_WORKSPACE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_PROJECT_WORKSPACE_FORM_BUTTONS_CONFIG,
  };
