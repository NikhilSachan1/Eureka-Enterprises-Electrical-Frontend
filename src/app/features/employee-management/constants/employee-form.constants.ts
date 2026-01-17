export const EMPLOYEE_FORM_STEPS = {
  PERSONAL_INFO: 1,
  EMPLOYMENT_INFO: 2,
  EDUCATION: 3,
  BANK_INFO: 4,
  DOCUMENTS: 5,
  SALARY: 6,
} as const;

export type EmployeeFormStep =
  (typeof EMPLOYEE_FORM_STEPS)[keyof typeof EMPLOYEE_FORM_STEPS];
