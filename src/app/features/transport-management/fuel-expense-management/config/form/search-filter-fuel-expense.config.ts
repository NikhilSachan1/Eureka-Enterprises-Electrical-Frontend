import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  EApprovalStatus,
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IFuelExpenseGetFormDto } from '../../types/fuel-expense.dto';
import { APP_PERMISSION } from '@core/constants';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';

const SEARCH_FILTER_FUEL_EXPENSE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IFuelExpenseGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    permission: [APP_PERMISSION.UI.FUEL_EXPENSE.TABLE_EMPLOYEE_NAME],
    multiSelectConfig: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig,
      dynamicDropdown: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig
          .dynamicDropdown,
        archivedHandling: 'enabled',
      },
    },
  },
  vehicleName: {
    fieldType: EDataType.SELECT,
    id: 'vehicleName',
    fieldName: 'vehicleName',
    label: 'Select Vehicle',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  fuelExpenseDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Fuel Expense Date',
    fieldName: 'fuelExpenseDate',
  },
  approvalStatus: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
    multiSelectConfig: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
      filterOptions: {
        exclude: [
          ...(COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus
            .multiSelectConfig.filterOptions?.exclude ?? []),
          EApprovalStatus.CANCELLED,
        ],
      },
    },
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by employee name, transaction id, amount, vehicle name, note',
  },
};

const SEARCH_FILTER_FUEL_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_FUEL_EXPENSE_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_FUEL_EXPENSE_FORM_BUTTONS_CONFIG,
  };
