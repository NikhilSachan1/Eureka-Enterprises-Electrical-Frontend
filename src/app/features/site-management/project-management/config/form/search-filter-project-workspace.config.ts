import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES, ROUTES } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IProjectWorkspaceSearchFilterFormDto } from '../../types/project.interface';

type WorkspaceSearchFilterFieldConfig =
  ITableSearchFilterInputFieldsConfig<IProjectWorkspaceSearchFilterFormDto>[keyof IProjectWorkspaceSearchFilterFormDto] & {
    visibleOnTabs?: string[];
  };

type WorkspaceSearchFilterFieldsConfig = {
  [K in keyof IProjectWorkspaceSearchFilterFormDto]: WorkspaceSearchFilterFieldConfig;
};

const { PROFITABILITY, GST_SUMMARY, WORKSPACE_DOC } = ROUTES.SITE.PROJECT;
const ALL_DOC_TABS = Object.values(WORKSPACE_DOC);
const GST_AND_DOC_TABS = [GST_SUMMARY, ...ALL_DOC_TABS];

const SEARCH_FILTER_PROJECT_WORKSPACE_FORM_FIELDS_CONFIG: WorkspaceSearchFilterFieldsConfig =
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
    companyName: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'companyName',
      fieldName: 'companyName',
      label: 'Company Name',
      visibleOnTabs: [PROFITABILITY, ...ALL_DOC_TABS],
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY,
          dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        },
      },
    },
    contractorName: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'contractorName',
      fieldName: 'contractorName',
      label: 'Contractor Name',
      visibleOnTabs: [PROFITABILITY, ...GST_AND_DOC_TABS],
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
      visibleOnTabs: [PROFITABILITY, ...GST_AND_DOC_TABS],
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VENDOR,
          dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
        },
      },
    },
    approvalStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'approvalStatus',
      fieldName: 'approvalStatus',
      label: 'Approval Status',
      visibleOnTabs: [
        WORKSPACE_DOC.PO,
        WORKSPACE_DOC.JMC,
        WORKSPACE_DOC.INVOICE,
      ],
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.FINANCIAL,
          dropdownName:
            CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_APPROVAL_STATUSES,
        },
      },
    },
    dateRange: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      label: 'start - end date',
      dateConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange.dateConfig,
        maxDate: new Date(),
      },
    },
    search: {
      fieldType: EDataType.TEXT,
      id: 'search',
      fieldName: 'search',
      label: 'Search',
      visibleOnTabs: ALL_DOC_TABS,
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
