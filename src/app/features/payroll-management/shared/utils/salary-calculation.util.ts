import { FormGroup } from '@angular/forms';
import { roundCurrencyAmount } from '@shared/utility';
import {
  EMPLOYEE_PF_AMOUNT,
  GROSS_SALARY_SPLIT_THRESHOLD,
  HIGH_GROSS_EARNINGS_SPLIT,
  LOW_GROSS_EARNINGS_SPLIT,
  MONTHLY_FOOD_ALLOWANCE_AMOUNT,
  PF_BASIC_THRESHOLD,
} from '@features/payroll-management/constants';
import { ISalaryGrossUiFormField } from '@features/payroll-management/types/payroll.interface';

export const ESIC_WAGE_CEILING = 21000;
export const ESIC_EMPLOYEE_CONTRIBUTION_RATE = 0.0075;

export interface IEarningsFromGross {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
}
export function calculateEmployeeEsic(basicSalary: number): number {
  const esicWageBase = basicSalary / 2;

  if (esicWageBase > ESIC_WAGE_CEILING) {
    return 0;
  }

  return roundCurrencyAmount(esicWageBase * ESIC_EMPLOYEE_CONTRIBUTION_RATE);
}

export function calculateEmployeePf(basicSalary: number): number {
  return Number(basicSalary ?? 0) > PF_BASIC_THRESHOLD ? EMPLOYEE_PF_AMOUNT : 0;
}

export function calculateEarningsFromGross(
  grossSalary: number
): IEarningsFromGross {
  const gross = Number(grossSalary ?? 0);

  if (gross <= 0) {
    return { basicSalary: 0, hra: 0, specialAllowance: 0 };
  }

  const split =
    gross <= GROSS_SALARY_SPLIT_THRESHOLD
      ? LOW_GROSS_EARNINGS_SPLIT
      : HIGH_GROSS_EARNINGS_SPLIT;

  return {
    basicSalary: roundCurrencyAmount(gross * split.basic),
    hra: roundCurrencyAmount(gross * split.hra),
    specialAllowance: roundCurrencyAmount(gross * split.specialAllowance),
  };
}

export function deriveGrossFromEarnings(
  basicSalary: number,
  hra: number,
  specialAllowance: number
): number {
  return roundCurrencyAmount(basicSalary + hra + specialAllowance);
}

export function syncFoodAllowance(formGroup: FormGroup): void {
  formGroup.patchValue(
    { foodAllowance: MONTHLY_FOOD_ALLOWANCE_AMOUNT },
    { emitEvent: true }
  );
}

export function syncDeductionsFromBasic(
  formGroup: FormGroup,
  basicSalary: number | null | undefined
): void {
  const basic = Number(basicSalary ?? 0);

  formGroup.patchValue(
    {
      employerEsicContribution: calculateEmployeeEsic(basic),
      employeePfContribution: calculateEmployeePf(basic),
    },
    { emitEvent: true }
  );
}

export function syncSalaryFieldsFromGross(
  formGroup: FormGroup,
  grossSalary: number | null | undefined
): void {
  const { basicSalary, hra, specialAllowance } = calculateEarningsFromGross(
    Number(grossSalary ?? 0)
  );

  formGroup.patchValue(
    {
      basicSalary,
      hra,
      specialAllowance,
      employerEsicContribution: calculateEmployeeEsic(basicSalary),
      employeePfContribution: calculateEmployeePf(basicSalary),
      foodAllowance: MONTHLY_FOOD_ALLOWANCE_AMOUNT,
    },
    { emitEvent: true }
  );
}

export function omitGrossSalaryFromFormData<
  T extends Partial<ISalaryGrossUiFormField>,
>(formData: T): Omit<T, 'grossSalary'> {
  const apiPayload = { ...formData };
  delete apiPayload.grossSalary;
  return apiPayload;
}
