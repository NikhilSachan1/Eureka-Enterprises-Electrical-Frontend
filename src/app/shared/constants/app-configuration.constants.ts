export const MODULE_NAMES = {
  EMPLOYEE: 'employee',
  EXPENSE: 'expense',
  FUEL_EXPENSE: 'fuel_expense',
  ATTENDANCE: 'attendance',
  COMMON: 'common',
  VEHICLE: 'vehicle',
  ASSET: 'asset',
  PETRO_CARD: 'petro_card',
  PAYROLL: 'payroll',
  COMPANY: 'company',
  CONTRACTOR: 'contractor',
  PROJECT: 'site',
  PERMISSION: 'permission',
  ANNOUNCEMENT: 'announcement',
  CONFIGURATION: 'configuration',
  GEOGRAPHY: 'geography',
} as const;

export const CONFIGURATION_KEYS = {
  CONFIGURATION: {
    CONFIGURATION_TYPE_DROPDOWN: 'configuration_type_dropdown',
  },
  COMMON: {
    APPROVAL_STATUS: 'approval_status_dropdown',
    ROLE_LIST: 'role_list',
    STATES: 'states',
    CITIES: 'cities',
  },
  EMPLOYEE: {
    GENDERS: 'genders',
    EMPLOYMENT_TYPES: 'employee_types',
    EMPLOYEE_STATUS: 'employee_status_dropdown',
    DESIGNATIONS: 'designations',
    DEGREES: 'degrees',
    BRANCHES: 'branches',
    BLOOD_GROUPS: 'blood_groups',
    PASSING_YEARS: 'passing_years',
    BANK_NAMES: 'bank_names_dropdown',
    EMPLOYEE_LIST: 'employee_list',
  },
  EXPENSE: {
    CATEGORIES: 'expense_categories',
    PAYMENT_METHODS: 'payment_modes',
  },
  FUEL_EXPENSE: {
    PAYMENT_METHODS: 'payment_modes',
  },
  ATTENDANCE: {
    STATUS: 'attendance_status_dropdown',
  },
  SITE: {
    CLIENT_LIST: 'client_list',
    LOCATION_LIST: 'location_list',
  },
  VEHICLE: {
    VEHICLE_LIST: 'vehicle_list',
    STATUS_LIST: 'vehicle_statuses',
    FUEL_TYPE_LIST: 'vehicle_fuel_types',
    DOCUMENT_STATUS_LIST: 'vehicle_document_statuses',
    SERVICE_ALERT_STATUS_LIST: 'vehicle_service_due_statuses',
    EVENT_STATUS_LIST: 'vehicle_event_types',
    SERVICE_TYPE_LIST: 'vehicle_service_types',
    SERVICE_STATUS: 'vehicle_service_statuses',
  },
  ASSET: {
    ASSET_LIST: 'asset_list',
    CATEGORY_LIST: 'asset_categories',
    TYPE_LIST: 'asset_types',
    STATUS_LIST: 'asset_statuses',
    CALIBRATION_SOURCE_LIST: 'calibration_sources',
    CALIBRATION_FREQUENCY_LIST: 'calibration_frequencies',
    CALIBRATION_STATUS_LIST: 'calibration_statuses',
    WARRANTY_STATUS_LIST: 'warranty_statuses',
    EVENT_STATUS_LIST: 'asset_event_types',
  },
  PETRO_CARD: {
    STATUS: 'petro_card_status_dropdown',
    PETRO_CARD_LIST: 'petro_card_list',
  },
  PAYROLL: {
    STATUS: 'payroll_statuses',
  },
  COMPANY: {
    COMPANY_LIST: 'company_list',
    COMPANY_STATUS: 'company_status_dropdown',
  },
  CONTRACTOR: {
    CONTRACTOR_LIST: 'contractor_list',
    CONTRACTOR_STATUS: 'contractor_status_dropdown',
  },
  PROJECT: {
    PROJECT_STATUS: 'site_statuses',
    PROJECT_WORK_TYPES: 'site_work_types',
  },
  PERMISSION: {
    MODULE_CONFIG_DROPDOWN: 'modules_config_dropdown',
  },
  ANNOUNCEMENT: {
    ANNOUNCEMENT_STATUS: 'announcement_statuses',
  },
  GEOGRAPHY: {
    LOCATION: 'location',
  },
} as const;
