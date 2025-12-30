export const MODULE_NAMES = {
  EMPLOYEE: 'employee',
  EXPENSE: 'expense',
  ATTENDANCE: 'attendance',
  COMMON: 'common',
  SITE: 'site',
  VEHICLE: 'vehicle',
  ASSET: 'asset',
} as const;

export const CONFIGURATION_KEYS = {
  COMMON: {
    APPROVAL_STATUS: 'approval_status',
    ROLE_LIST: 'role_list',
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
    EMPLOYEE_LIST: 'employee_list',
  },
  EXPENSE: {
    CATEGORIES: 'expense_categories',
    PAYMENT_METHODS: 'payment_modes',
  },
  ATTENDANCE: {
    STATUS: 'attendance_status',
  },
  SITE: {
    CLIENT_LIST: 'client_list',
    LOCATION_LIST: 'location_list',
  },
  VEHICLE: {
    VEHICLE_LIST: 'vehicle_list',
  },
  ASSET: {
    CATEGORY_LIST: 'asset_categories',
    TYPE_LIST: 'asset_types',
    STATUS_LIST: 'asset_statuses',
    CALIBRATION_SOURCE_LIST: 'calibration_sources',
    CALIBRATION_FREQUENCY_LIST: 'calibration_frequencies',
    CALIBRATION_STATUS_LIST: 'calibration_statuses',
    WARRANTY_STATUS_LIST: 'warranty_statuses',
  },
} as const;
