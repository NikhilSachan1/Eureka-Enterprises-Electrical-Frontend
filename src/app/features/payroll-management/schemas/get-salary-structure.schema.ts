import { z } from 'zod';
import {
  AuditSchema,
  FilterSchema,
  onlyDateStringField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const SalaryStructureGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    employeeName: z.string().optional(),
  })
  .strict()
  .transform(({ employeeName, ...rest }) => {
    return {
      ...rest,
      userId: employeeName,
    };
  });

export const salaryStructureSchema = z.looseObject({
  basic: z.string(),
  hra: z.string(),
  foodAllowance: z.string(),
  conveyanceAllowance: z.string().nullable(),
  medicalAllowance: z.string().nullable(),
  specialAllowance: z.string().nullable(),
  employeePf: z.string().nullable(),
  employerPf: z.string().nullable(),
  esic: z.string().nullable(),
  tds: z.string().nullable(),
  professionalTax: z.string().nullable(),
  grossSalary: z.string(),
  totalDeductions: z.string(),
  netSalary: z.string(),
  ctc: z.string(),
  effectiveFrom: onlyDateStringField,
});

export const SalaryStructureGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  userId: uuidField,
  ...salaryStructureSchema.shape,
  effectiveTo: onlyDateStringField.nullable(),
  isActive: z.boolean(),
  incrementPercentage: z.string().nullable(),
  incrementType: z.string(),
  previousStructureId: uuidField.nullable(),
  remarks: z.string().nullable(),
  user: makeFieldsNullable(UserSchema).nullable(),
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  ...AuditSchema.shape,
});

export const SalaryStructureGetResponseSchema = z.looseObject({
  records: z.array(SalaryStructureGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
