/** Fixed monthly fooding amount (not part of CTC). */
export const MONTHLY_FOOD_ALLOWANCE_AMOUNT = 9000;

/** Gross salary threshold for earnings split (inclusive at or below). */
export const GROSS_SALARY_SPLIT_THRESHOLD = 30000;

/** Gross <= threshold: 70% basic, 15% HRA, 15% SA. */
export const LOW_GROSS_EARNINGS_SPLIT = {
  basic: 0.7,
  hra: 0.15,
  specialAllowance: 0.15,
} as const;

/** Gross > threshold: 50% basic, 25% HRA, 25% SA. */
export const HIGH_GROSS_EARNINGS_SPLIT = {
  basic: 0.5,
  hra: 0.25,
  specialAllowance: 0.25,
} as const;

/** Employee PF applies when basic exceeds this amount. */
export const PF_BASIC_THRESHOLD = 15000;

/** Fixed employee PF amount when basic is above threshold. */
export const EMPLOYEE_PF_AMOUNT = 1800;
