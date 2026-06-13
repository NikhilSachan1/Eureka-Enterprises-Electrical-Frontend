import { FormGroup } from '@angular/forms';
import { parseAmount } from '@shared/utility';
import {
  ESIC_EMPLOYEE_CONTRIBUTION_RATE,
  ESIC_WAGE_CEILING,
  GROSS_SALARY_SPLIT_THRESHOLD,
  HIGH_GROSS_BASIC_RATIO,
  LOW_GROSS_BASIC_RATIO,
  MONTHLY_FOOD_ALLOWANCE_AMOUNT,
  PF_CONTRIBUTION_RATE,
  PF_WAGE_CAP,
} from '@features/payroll-management/constants';
import {
  IEmployeeAnnexure,
  ISalaryGrossUiFormField,
} from '@features/payroll-management/types/payroll.interface';

export interface IEarningsFromGross {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
}

/** Standard salary round-off to nearest rupee. */
function roundToRupee(value: number): number {
  return Math.round(value);
}

function calculatePfContribution(basicSalary: number): number {
  const pfWage = Math.min(Number(basicSalary ?? 0), PF_WAGE_CAP);
  return roundToRupee(pfWage * PF_CONTRIBUTION_RATE);
}

export function calculateEmployeePf(basicSalary: number): number {
  return calculatePfContribution(basicSalary);
}

export function calculateEmployerPf(basicSalary: number): number {
  return calculatePfContribution(basicSalary);
}

export function calculateEmployeeEsic(basicSalary: number): number {
  const basic = Number(basicSalary ?? 0);

  if (basic > ESIC_WAGE_CEILING) {
    return 0;
  }

  return roundToRupee(basic * ESIC_EMPLOYEE_CONTRIBUTION_RATE);
}

export function calculateEarningsFromGross(
  grossSalary: number
): IEarningsFromGross {
  const gross = Number(grossSalary ?? 0);

  if (gross <= 0) {
    return { basicSalary: 0, hra: 0, specialAllowance: 0 };
  }

  const basicRatio =
    gross <= GROSS_SALARY_SPLIT_THRESHOLD
      ? LOW_GROSS_BASIC_RATIO
      : HIGH_GROSS_BASIC_RATIO;

  const basicSalary = roundToRupee(gross * basicRatio);
  const remainder = gross - basicSalary;
  const allowanceHalf = Math.floor(remainder / 2);
  const oddRupee = remainder - allowanceHalf * 2;

  return {
    basicSalary: basicSalary + oddRupee,
    hra: allowanceHalf,
    specialAllowance: allowanceHalf,
  };
}

export function calculateNetSalary(
  grossSalary: number,
  basicSalary: number
): number {
  const employeePf = calculateEmployeePf(basicSalary);
  const esic = calculateEmployeeEsic(basicSalary);

  return roundToRupee(Number(grossSalary ?? 0) - employeePf - esic);
}

export function deriveGrossFromEarnings(
  basicSalary: number,
  hra: number,
  specialAllowance: number
): number {
  return roundToRupee(basicSalary + hra + specialAllowance);
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

export function buildEarningsAnnexure(amounts: {
  basic?: string | null;
  hra?: string | null;
  specialAllowance?: string | null;
  grossSalary?: string | null;
}): IEmployeeAnnexure['earnings'] {
  return {
    items: [
      { label: 'Basic Salary', value: parseAmount(amounts.basic) },
      { label: 'HRA', value: parseAmount(amounts.hra) },
      {
        label: 'Special Allowance',
        value: parseAmount(amounts.specialAllowance),
      },
    ],
    total: parseAmount(amounts.grossSalary),
  };
}

export function buildDeductionsAnnexure(amounts: {
  employeePf?: string | null;
  esic?: string | null;
  totalDeductions?: string | null;
}): IEmployeeAnnexure['deductions'] {
  return {
    items: [
      { label: 'Employee PF', value: parseAmount(amounts.employeePf) },
      { label: 'ESIC', value: parseAmount(amounts.esic) },
    ],
    total: parseAmount(amounts.totalDeductions),
  };
}

/** API salary amounts (`netSalary`, `ctc`) are monthly; annual = monthly × 12. */
function buildMonthlyAnnualSummary(amount?: string | null): {
  monthlyValue: number;
  annualValue: number;
} {
  const monthly = parseAmount(amount);
  return {
    monthlyValue: monthly,
    annualValue: monthly * 12,
  };
}

export function buildNetSalarySummary(
  netSalary?: string | null
): ReturnType<typeof buildMonthlyAnnualSummary> {
  return buildMonthlyAnnualSummary(netSalary);
}

export function buildCtcSummary(
  ctc?: string | null
): ReturnType<typeof buildMonthlyAnnualSummary> {
  return buildMonthlyAnnualSummary(ctc);
}

/** DB `esic` is employee deduction only; employer benefits use `employerPf`. */
export function buildEmployerBenefitsAnnexure(
  employerPf?: string | null
): IEmployeeAnnexure['employerBenefits'] {
  const pf = parseAmount(employerPf);

  return {
    items: [{ label: 'Employer PF', value: pf }],
    total: pf,
  };
}
