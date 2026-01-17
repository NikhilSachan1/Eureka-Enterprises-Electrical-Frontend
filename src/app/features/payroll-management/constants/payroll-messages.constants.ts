/**
 * Constants for payroll management messages
 */
export const PAYROLL_MESSAGES = {
  LOADING: {
    // Action Payroll
    PAID: 'Marking as Paid',
    CANCEL: 'Cancelling Payslip',
    APPROVE: 'Approving Payslip',
    // Add Salary Increment
    ADD_SALARY_INCREMENT: 'Add Salary Increment',
    LOAD_EMPLOYEE_SALARY_DETAIL: 'Loading Employee Latest Salary Detail',
    // Edit Salary
    EDIT_SALARY: 'Edit Salary',
    // Generate Payroll
    GENERATE_PAYROLL: 'Generate Payroll',
    // Get Payslip
    PAYSLIP_LIST: 'Loading Payslip List',
    PAYSLIP_DETAIL: 'Loading Payslip',
    PAYSLIP_DETAILS: 'Loading Payslip Details',
    // Get Salary Structure
    SALARY_STRUCTURE_LIST: 'Loading Salary Structure',
    // Get Salary Structure History
    SALARY_REVISION_HISTORY: 'Loading Salary Revision History',
  },
  LOADING_MESSAGES: {
    // Action Payroll
    PAID: 'Please wait while we mark the payslip as paid...',
    CANCEL: 'Please wait while we cancel the payslip...',
    APPROVE: 'Please wait while we approve the payslip...',
    // Add Salary Increment
    ADD_SALARY_INCREMENT: 'Please wait while we add salary increment...',
    LOAD_EMPLOYEE_SALARY_DETAIL:
      'Please wait while we load the employee latest salary detail...',
    // Edit Salary
    EDIT_SALARY: 'Please wait while we edit salary...',
    // Generate Payroll
    GENERATE_PAYROLL: 'Please wait while we generate payroll...',
    // Get Payslip
    PAYSLIP_LIST: 'Please wait while we load the payslip list...',
    PAYSLIP_DETAIL: 'Please wait while we load the payslip...',
    PAYSLIP_DETAILS: 'Please wait while we load the payslip details...',
    // Get Salary Structure
    SALARY_STRUCTURE_LIST: 'Please wait while we load the salary structure...',
    // Get Salary Structure History
    SALARY_REVISION_HISTORY:
      'Please wait while we load the salary revision history...',
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
