import { z } from 'zod';
import {
  AuditSchema,
  FilterSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { EPayslipStatus } from '../types/payroll.enum';
import { dateField } from '@shared/schemas/common.schema';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const PayslipGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    employeeName: z.string().optional(),
    monthYear: dateField.optional(),
    payrollStatus: z.enum(EPayslipStatus).optional(),
  })
  .strict()
  .transform(({ employeeName, monthYear, payrollStatus, ...rest }) => {
    return {
      ...rest,
      userId: employeeName,
      ...(monthYear && {
        month: monthYear.getMonth() + 1,
        year: monthYear.getFullYear(),
      }),
      status: payrollStatus,
    };
  });

export const PayslipGetBaseResponseSchema = z
  .object({
    ...AuditSchema.shape,
    id: uuidField,
    userId: uuidField,
    salaryStructureId: uuidField,
    month: z.number().int().nonnegative(),
    year: z.number().int().nonnegative(),
    totalDays: z.number().int().nonnegative(),
    workingDays: z.number().int().nonnegative(),
    presentDays: z.number().int().nonnegative(),
    absentDays: z.number().int().nonnegative(),
    paidLeaveDays: z.number().int().nonnegative(),
    unpaidLeaveDays: z.number().int().nonnegative(),
    holidays: z.number().int().nonnegative(),
    holidaysWorked: z.number().int().nonnegative(),
    weekoffs: z.number().int().nonnegative(),
    basicProrated: z.string(),
    hraProrated: z.string(),
    foodAllowanceProrated: z.string(),
    conveyanceAllowanceProrated: z.string(),
    medicalAllowanceProrated: z.string(),
    specialAllowanceProrated: z.string(),
    employeePf: z.string(),
    employerPf: z.string(),
    esic: z.string(),
    tds: z.string(),
    professionalTax: z.string(),
    lopDeduction: z.string(),
    totalBonus: z.string(),
    holidayBonus: z.string(),
    holidayLeavesCredited: z.number().int().nonnegative(),
    bonusDetails: z.array(z.object({})), // ToDo kya aayga ismeh
    leaveDetails: z.array(z.object({})), // ToDo kya aayga ismeh
    halfDays: z.string(),
    grossEarnings: z.string(),
    totalDeductions: z.string(),
    netPayable: z.string(),
    status: z.enum(EPayslipStatus).default(EPayslipStatus.DRAFT),
    generatedAt: isoDateTimeField,
    approvedAt: isoDateTimeField.nullable(),
    approvedBy: uuidField.nullable(),
    paidAt: isoDateTimeField.nullable(),
    remarks: z.string().nullable(),
    user: z.looseObject(UserSchema.shape),
    salaryStructure: z.object({
      id: uuidField,
      grossSalary: z.string(),
      netSalary: z.string(),
    }),
  })
  .strict();

export const PayslipGetResponseSchema = z
  .object({
    records: z.array(PayslipGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
