/**
 * Constants for payroll management messages
 */
export const PAYROLL_MESSAGES = {
  LOADING: {
    // Action Payroll
    PAID: 'Marking payslip as paid',
    CANCEL: 'Cancelling payslip',
    APPROVE: 'Approving payslip',
    // Add Salary Increment
    ADD_SALARY_INCREMENT: 'Adding salary increment',
    LOAD_EMPLOYEE_SALARY_DETAIL: 'Loading latest salary details',
    // Update salary
    EDIT_SALARY: 'Updating salary',
    // Generate Payroll
    GENERATE_PAYROLL: 'Generating payroll',
    // Get Payslip
    PAYSLIP_LIST: 'Loading payslips',
    PAYSLIP_DETAIL: 'Loading payslip',
    PAYSLIP_DETAILS: 'Loading payslip details',
    // Get Salary Structure
    SALARY_STRUCTURE_LIST: 'Loading salary structures',
    // Get Salary Structure History
    SALARY_REVISION_HISTORY: 'Loading salary revision history',
  },
  LOADING_MESSAGES: {
    // Action Payroll
    PAID: "We're marking this payslip as paid. This will just take a moment.",
    CANCEL: "We're cancelling this payslip. This will just take a moment.",
    APPROVE: "We're approving this payslip. This will just take a moment.",
    // Add Salary Increment
    ADD_SALARY_INCREMENT:
      "We're adding this salary increment. This will just take a moment.",
    LOAD_EMPLOYEE_SALARY_DETAIL:
      "We're loading the latest salary details. This will just take a moment.",
    // Update salary
    EDIT_SALARY:
      "We're updating your salary changes. This will just take a moment.",
    // Generate Payroll
    GENERATE_PAYROLL: "We're generating payroll. This will just take a moment.",
    // Get Payslip
    PAYSLIP_LIST: "We're loading payslips. This will just take a moment.",
    PAYSLIP_DETAIL: "We're loading this payslip. This will just take a moment.",
    PAYSLIP_DETAILS:
      "We're loading payslip details. This will just take a moment.",
    // Get Salary Structure
    SALARY_STRUCTURE_LIST:
      "We're loading salary structures. This will just take a moment.",
    // Get Salary Structure History
    SALARY_REVISION_HISTORY:
      "We're loading salary revision history. This will just take a moment.",
  },
  SUCCESS: {
    // Add Salary Increment
    ADD_SALARY_INCREMENT: 'Salary increment added successfully',
    // Edit Salary
    EDIT_SALARY: 'Salary updated successfully',
    // Get Payslip
    PAYSLIP_LIST_LOADED: 'Payslip list loaded successfully',
    PAYSLIP_DETAIL_LOADED: 'Payslip loaded successfully',
    PAYSLIP_DETAILS_LOADED: 'Payslip details loaded successfully',
    // Get Salary Structure
    SALARY_STRUCTURE_LIST_LOADED:
      'Salary structure records loaded successfully',
    // Get Salary Structure History
    SALARY_REVISION_HISTORY_LOADED:
      'Salary revision history loaded successfully',
  },
  ERROR: {
    // Add Salary Increment
    ADD_SALARY_INCREMENT: 'Failed to add salary increment',
    LOAD_EMPLOYEE_SALARY_DETAIL: 'Failed to load employee salary detail',
    // Edit Salary
    EDIT_SALARY: 'Failed to update salary',
    NO_SALARY_DATA: 'No salary data found in route',
    NO_SALARY_STRUCTURE_ID: 'No salary structure id found in route',
    // Get Payslip
    PAYSLIP_LIST_LOAD_FAILED: 'Failed to load payslip list',
    PAYSLIP_DETAIL_LOAD_FAILED: 'Failed to load payslip',
    PAYSLIP_DETAILS_LOAD_FAILED: 'Payslip details loading failed',
    // Get Salary Structure
    SALARY_STRUCTURE_LIST_LOAD_FAILED: 'Failed to load salary structure',
    NAVIGATION_ERROR: 'Navigation error while editing salary structure',
    // Get Salary Structure History
    SALARY_REVISION_HISTORY_LOAD_FAILED:
      'Failed to load salary revision history',
  },
  VALIDATION: {
    // Action Payroll
    ACTION_PAYROLL_RECORD_REQUIRED:
      'Selected record is required to approve/cancell/paid payroll but was not provided',
    // Generate Payroll
    GENERATE_PAYROLL_RECORD_REQUIRED:
      'Selected record is required to generate payroll but was not provided',
  },
  PAGE_HEADER: {
    // Add Salary Increment
    ADD_SALARY_INCREMENT_TITLE: 'Add Salary Increment',
    ADD_SALARY_INCREMENT_SUBTITLE: 'Add a new salary increment',
    // Edit Salary
    EDIT_SALARY_TITLE: 'Edit Salary',
    EDIT_SALARY_SUBTITLE: 'Modify salary structure and components',
    // Get Payslip
    PAYSLIP_MANAGEMENT_TITLE: 'Payslip Management',
    PAYSLIP_MANAGEMENT_SUBTITLE: 'Manage payslip records',
    // Get Salary Structure
    SALARY_STRUCTURE_MANAGEMENT_TITLE: 'Salary Structure Management',
    SALARY_STRUCTURE_MANAGEMENT_SUBTITLE: 'Manage salary structure records',
  },
  DRAWER: {
    // Get Payslip
    PAYSLIP_DETAIL_SUBTITLE: 'Detailed view of payslip',
    // Get Salary Structure
    SALARY_STRUCTURE_REVISION_SUBTITLE: 'View all salary structure revisions',
  },
  SUMMARY: {
    NET_SALARY: 'Net Salary (In Hand)',
    ANNUAL_CTC: 'Annual CTC',
  },
  ENTITY: {
    SUBTITLE_NA: 'N/A',
    LABEL_PAYROLL: 'payroll',
  },
} as const;
