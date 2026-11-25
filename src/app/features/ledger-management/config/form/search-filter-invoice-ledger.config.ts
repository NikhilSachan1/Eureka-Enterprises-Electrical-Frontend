import {
  COMMON_FORM_ACTIONS,
  FINANCIAL_QUARTER_DATA,
  FINANCIAL_YEAR_DATA,
  INVOICE_PAYMENT_STATUS_DATA,
} from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { EInvoiceLedgerSide } from '../../types/invoice-ledger.enum';
import {
  IInvoiceLedgerSearchFilterFormDto,
  IInvoiceLedgerSideConfig,
} from '../../types/invoice-ledger.interface';

const INVOICE_LEDGER_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: { ...COMMON_FORM_ACTIONS.RESET },
  submit: { ...COMMON_FORM_ACTIONS.FILTER },
};

export function createInvoiceLedgerSearchFilterConfig(
  sideConfig: IInvoiceLedgerSideConfig
): ITableSearchFilterFormConfig<IInvoiceLedgerSearchFilterFormDto> {
  const isContractor = sideConfig.side === EInvoiceLedgerSide.CONTRACTOR;

  const fields: ITableSearchFilterInputFieldsConfig<IInvoiceLedgerSearchFilterFormDto> =
    {
      partyName: {
        fieldType: EDataType.MULTI_SELECT,
        id: 'partyName',
        fieldName: 'partyName',
        label: `${sideConfig.partyLabel} Name`,
        multiSelectConfig: {
          dynamicDropdown: isContractor
            ? {
                moduleName: MODULE_NAMES.CONTRACTOR,
                dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
              }
            : {
                moduleName: MODULE_NAMES.VENDOR,
                dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
              },
        },
        matchmode: ETableFilterMatchMode.IN,
      },
      companyName: {
        fieldType: EDataType.MULTI_SELECT,
        id: 'companyName',
        fieldName: 'companyName',
        label: 'Company Name',
        multiSelectConfig: {
          dynamicDropdown: {
            moduleName: MODULE_NAMES.COMPANY,
            dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
          },
        },
        matchmode: ETableFilterMatchMode.IN,
      },
      projectName: {
        fieldType: EDataType.MULTI_SELECT,
        id: 'projectName',
        fieldName: 'projectName',
        label: 'Project Name',
        multiSelectConfig: {
          dynamicDropdown: {
            moduleName: MODULE_NAMES.PROJECT,
            dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
          },
        },
        matchmode: ETableFilterMatchMode.IN,
      },
      financialYear: {
        fieldType: EDataType.SELECT,
        id: 'financialYear',
        fieldName: 'financialYear',
        label: 'Financial Year',
        selectConfig: {
          optionsDropdown: FINANCIAL_YEAR_DATA,
          showClearButton: true,
        },
        matchmode: ETableFilterMatchMode.EQUALS,
      },
      quarter: {
        fieldType: EDataType.MULTI_SELECT,
        id: 'quarter',
        fieldName: 'quarter',
        label: 'Quarter',
        multiSelectConfig: {
          optionsDropdown: FINANCIAL_QUARTER_DATA,
          haveFilter: false,
          showToggleAll: false,
        },
        matchmode: ETableFilterMatchMode.IN,
      },
      paymentStatus: {
        fieldType: EDataType.MULTI_SELECT,
        id: 'paymentStatus',
        fieldName: 'paymentStatus',
        label: 'Payment Status',
        multiSelectConfig: {
          optionsDropdown: INVOICE_PAYMENT_STATUS_DATA,
          haveFilter: false,
          showToggleAll: false,
        },
        matchmode: ETableFilterMatchMode.IN,
      },
      dateRange: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
        label: 'Invoice date range',
      },
      globalSearch: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
        hint: 'Search by invoice or PO number',
      },
    };

  return { fields, buttons: INVOICE_LEDGER_FORM_BUTTONS_CONFIG };
}
