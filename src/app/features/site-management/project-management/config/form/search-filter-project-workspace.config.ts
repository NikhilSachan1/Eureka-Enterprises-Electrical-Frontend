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
import { APP_PERMISSION } from '@core/constants';

type WorkspaceSearchFilterFieldConfig =
  ITableSearchFilterInputFieldsConfig<IProjectWorkspaceSearchFilterFormDto>[keyof IProjectWorkspaceSearchFilterFormDto] & {
    visibleOnTabs?: string[];
  };

type WorkspaceSearchFilterFieldsConfig = {
  [K in keyof IProjectWorkspaceSearchFilterFormDto]: WorkspaceSearchFilterFieldConfig;
};

const { GST_SUMMARY, TDS_SUMMARY, WORKSPACE_DOC, DAILY_PROGRESS } =
  ROUTES.SITE.PROJECT;
const ALL_DOC_TABS = Object.values(WORKSPACE_DOC);
const GST_TDS_AND_DOC_TABS = [GST_SUMMARY, TDS_SUMMARY, ...ALL_DOC_TABS];
const WORKSPACE_TABS_EXCEPT_PROFITABILITY = [
  DAILY_PROGRESS,
  ...GST_TDS_AND_DOC_TABS,
];

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
      visibleOnTabs: ALL_DOC_TABS,
      permission: [APP_PERMISSION.UI.PROJECT.SEARCH_FILTER_COMPANY_NAME],
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
      visibleOnTabs: GST_TDS_AND_DOC_TABS,
      permission: [APP_PERMISSION.UI.PROJECT.SEARCH_FILTER_CONTRACTOR_NAME],
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
      visibleOnTabs: GST_TDS_AND_DOC_TABS,
      permission: [APP_PERMISSION.UI.PROJECT.SEARCH_FILTER_VENDOR_NAME],
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
      visibleOnTabs: WORKSPACE_TABS_EXCEPT_PROFITABILITY,
      dateConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange.dateConfig,
        maxDate: new Date(),
      },
    },
    search: {
      fieldType: EDataType.TEXT,
      id: 'search',
      fieldName: 'search',
      label: 'Search By PO Number',
      visibleOnTabs: ALL_DOC_TABS,
    },
    paidFromAccount: {
      fieldType: EDataType.SELECT,
      id: 'paidFromAccount',
      fieldName: 'paidFromAccount',
      label: 'Paid From Account',
      visibleOnTabs: [ROUTES.SITE.PROJECT.WORKSPACE_DOC.BANK_TRANSFER],
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY_BANK_ACCOUNT,
          dropdownName:
            CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
        },
      },
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
