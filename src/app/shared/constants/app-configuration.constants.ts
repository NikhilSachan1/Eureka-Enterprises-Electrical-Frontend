export const MODULE_NAMES = {
  EMPLOYEE: 'employee',
  EXPENSE: 'expense',
  ATTENDANCE: 'attendance',
  COMMON: 'common',
} as const;

export const CONFIGURATION_KEYS = {
  COMMON: {
    APPROVAL_STATUS: 'approval_status',
  },
  EMPLOYEE: {
    GENDERS: 'genders',
    EMPLOYMENT_TYPES: 'employee_types',
    EMPLOYEE_STATUS: 'employee_status',
    DESIGNATIONS: 'designations',
    DEGREES: 'degrees',
    BRANCHES: 'branches',
    BLOOD_GROUPS: 'blood_groups',
    PASSING_YEARS: 'passing_years',
    BANK_NAMES: 'bank_names',
    STATES: 'states',
    CITIES: 'cities',
  },
  EXPENSE: {
    CATEGORIES: 'expense_categories',
    PAYMENT_METHODS: 'payment_modes',
  },
  ATTENDANCE: {
    STATUS: 'attendance_status',
  },
} as const;
