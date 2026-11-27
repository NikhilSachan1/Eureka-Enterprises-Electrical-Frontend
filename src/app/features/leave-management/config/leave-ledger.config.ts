import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_FORM_ACTIONS, FINANCIAL_YEAR_DATA } from '@shared/config';
import { CONFIGURATION_KEYS, ICONS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  IPageHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import {
  ILeaveLedgerSearchFilterFormDto,
  ILeaveLedgerTableRow,
} from '../types/leave-ledger.interface';

export const LEAVE_LEDGER_PAGE_HEADER: IPageHeaderConfig = {
  title: 'Leave Ledger',
  subtitle:
    'Leave earned and used, like a bank passbook. Leave is earned from attendance every month.',
};

/** Office roles before picking anyone: shown in place of the table, like the event history pages. */
export const LEAVE_LEDGER_NO_EMPLOYEE_STATE = {
  icon: ICONS.COMMON.BOOK,
  title: 'No Employee Selected',
  description:
    'Please select an employee from the filter above to view their leave ledger.',
} as const;

const LEAVE_LEDGER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessage: 'No leave entries yet.',
  emptyMessageDescription:
    'Leave earned and leave taken in the selected financial year will show here.',
};

const LEAVE_LEDGER_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'date',
    header: 'Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    showSort: false,
  },
  {
    field: 'particulars',
    header: 'Particulars',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'particularsNote' },
    showImage: true,
    iconField: 'icon',
    backgroundSeedField: 'entryType',
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'credit',
    header: 'Credit (+)',
    customTemplateKey: 'ledgerCredit',
    showSort: false,
  },
  {
    field: 'debit',
    header: 'Debit (−)',
    customTemplateKey: 'ledgerDebit',
    showSort: false,
  },
  {
    field: 'balance',
    header: 'Balance',
    customTemplateKey: 'ledgerBalance',
    showSort: false,
  },
];

export const LEAVE_LEDGER_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<ILeaveLedgerTableRow> =
  {
    tableConfig: LEAVE_LEDGER_TABLE_CONFIG,
    headers: LEAVE_LEDGER_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };

export const SEARCH_FILTER_LEAVE_LEDGER_FORM_CONFIG: ITableSearchFilterFormConfig<ILeaveLedgerSearchFilterFormDto> =
  {
    fields: {
      employeeName: {
        fieldType: EDataType.SELECT,
        id: 'employeeName',
        fieldName: 'employeeName',
        label: 'Employee',
        selectConfig: {
          dynamicDropdown: {
            moduleName: MODULE_NAMES.EMPLOYEE,
            dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
            archivedHandling: 'enabled',
          },
          showClearButton: true,
        },
        matchmode: ETableFilterMatchMode.EQUALS,
        permission: [APP_PERMISSION.LEAVE.LEDGER_VIEW_ALL],
      },
      financialYear: {
        fieldType: EDataType.SELECT,
        id: 'financialYear',
        fieldName: 'financialYear',
        label: 'Financial Year',
        hint: 'Empty = current financial year',
        selectConfig: {
          optionsDropdown: FINANCIAL_YEAR_DATA,
          showClearButton: true,
        },
        matchmode: ETableFilterMatchMode.EQUALS,
      },
    },
    buttons: {
      reset: { ...COMMON_FORM_ACTIONS.RESET },
      submit: { ...COMMON_FORM_ACTIONS.FILTER },
    },
  };
