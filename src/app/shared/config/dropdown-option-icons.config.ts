import { CONFIGURATION_KEYS } from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import { IOptionDropdown } from '@shared/types';

const EXPENSE_CATEGORY_DEFAULT = ICONS.EXPENSE.MONEY;
const EMPLOYEE_STATUS_DEFAULT = ICONS.COMMON.INFO_CIRCLE;
const PAYMENT_MODE_DEFAULT = ICONS.COMMON.CREDIT_CARD;
const ROLE_ICON_DEFAULT = ICONS.COMMON.USER;

/** Icons by expense category `value` from configuration API. */
const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  settlement: ICONS.PAYROLL.WALLET,
  fnf_settlement: ICONS.PAYROLL.WALLET,
  hotel: ICONS.SITE.BUILDING,
  tools: ICONS.SETTINGS.WRENCH,
  toll_cash: ICONS.EXPENSE.CAR,
  car_service: ICONS.EXPENSE.CAR,
  train: ICONS.COMMON.COMPASS,
  bus: ICONS.COMMON.CAR,
  local_convence: ICONS.COMMON.MAP_MARKER,
  stationery: ICONS.ACTIONS.PENCIL,
  safety_equipment: ICONS.SECURITY.SHIELD,
  other: ICONS.COMMON.TAG,
};

/** Payment mode values (expense + fuel expense share `payment_modes`). */
const PAYMENT_MODE_ICONS: Record<string, string> = {
  upi: ICONS.COMMON.MOBILE,
  cheque: ICONS.EXPENSE.MONEY,
  credit_card: ICONS.COMMON.CREDIT_CARD,
  cash: ICONS.PAYROLL.WALLET,
  'neft/imps': ICONS.ACTIONS.SEND,
  neft: ICONS.ACTIONS.SEND,
  imps: ICONS.ACTIONS.SEND,
  system: ICONS.COMMON.SYNC,
  rtgs: ICONS.ACTIONS.SEND,
  debit: ICONS.COMMON.ARROW_DOWN,
  credit: ICONS.COMMON.ARROW_UP,
};

/** App role `value` (lowercase keys; matched via `value.toLowerCase()`). */
const ROLE_ICONS: Record<string, string> = {
  admin: ICONS.SECURITY.SHIELD,
  super_admin: ICONS.SECURITY.SHIELD,
  manager: ICONS.COMMON.BRIEFCASE,
  employee: ICONS.EMPLOYEE.USER,
  driver: ICONS.COMMON.CAR,
  technician: ICONS.SETTINGS.WRENCH,
};

/**
 * Maps configuration dropdown keys → option value → PrimeIcons class string.
 * Used when hydrating app configuration dropdowns.
 */
const DROPDOWN_OPTION_ICON_MAP: Record<string, Record<string, string>> = {
  [CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS]: {
    pending: ICONS.ATTENDANCE.REGULARIZE,
    approved: ICONS.ACTIONS.CHECK_CIRCLE,
    rejected: ICONS.ACTIONS.TIMES,
    cancelled: ICONS.ACTIONS.BAN,
    not_applicable: ICONS.COMMON.INFO_CIRCLE,
  },
  [CONFIGURATION_KEYS.ATTENDANCE.STATUS]: {
    present: ICONS.ACTIONS.CHECK_CIRCLE,
    absent: ICONS.ACTIONS.TIMES,
    leave: ICONS.LEAVE.GET,
    holiday: ICONS.ATTENDANCE.CALENDAR,
    checkedin: ICONS.ATTENDANCE.CHECK_IN,
    checkedout: ICONS.ATTENDANCE.CHECK_OUT,
    notcheckedinyet: ICONS.ATTENDANCE.REGULARIZE,
  },
  [CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS]: {
    active: ICONS.ACTIONS.CHECK_CIRCLE,
    inactive: ICONS.ACTIONS.TIMES,
    archived: ICONS.COMMON.HISTORY,
  },
  [CONFIGURATION_KEYS.EXPENSE.CATEGORIES]: EXPENSE_CATEGORY_ICONS,
};

/**
 * Attach `icon` on options for configured dropdowns (approval, attendance, expense,
 * employee status, payment modes, roles, etc.).
 */
export function applyIconsToDropdownOptions(
  dropdownKey: string,
  options: IOptionDropdown[]
): IOptionDropdown[] {
  if (
    dropdownKey === CONFIGURATION_KEYS.EXPENSE.PAYMENT_METHODS ||
    dropdownKey === CONFIGURATION_KEYS.FUEL_EXPENSE.PAYMENT_METHODS
  ) {
    return options.map(opt => {
      if (opt.icon) {
        return opt;
      }
      const k = opt.value.toLowerCase();
      const icon = PAYMENT_MODE_ICONS[k] ?? PAYMENT_MODE_DEFAULT;
      return { ...opt, icon };
    });
  }

  if (dropdownKey === CONFIGURATION_KEYS.COMMON.ROLE_LIST) {
    return options.map(opt => {
      if (opt.icon) {
        return opt;
      }
      const k = opt.value.toLowerCase();
      const icon = ROLE_ICONS[k] ?? ROLE_ICON_DEFAULT;
      return { ...opt, icon };
    });
  }

  const map = DROPDOWN_OPTION_ICON_MAP[dropdownKey];
  if (!map) {
    return options;
  }

  return options.map(opt => {
    if (opt.icon) {
      return opt;
    }
    const normalized =
      map[opt.value.toLowerCase()] ??
      map[opt.value.replace(/\s+/g, '').toLowerCase()] ??
      map[opt.value];

    if (dropdownKey === CONFIGURATION_KEYS.EXPENSE.CATEGORIES) {
      return { ...opt, icon: normalized ?? EXPENSE_CATEGORY_DEFAULT };
    }
    if (dropdownKey === CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS) {
      return { ...opt, icon: normalized ?? EMPLOYEE_STATUS_DEFAULT };
    }
    if (!normalized) {
      return opt;
    }
    return { ...opt, icon: normalized };
  });
}
