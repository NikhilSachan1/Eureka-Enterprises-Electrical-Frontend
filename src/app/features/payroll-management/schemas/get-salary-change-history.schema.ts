import { z } from 'zod';
import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { EPayrollChangeType } from '../types/payroll.enum';
import { salaryStructureSchema } from './get-salary-structure.schema';

export const SalaryStructureHistoryGetRequestSchema = z
  .object({
    salaryStructureId: uuidField,
  })
  .strict()
  .transform(({ salaryStructureId }) => {
    return {
      id: salaryStructureId,
    };
  });

export const SalaryStructureHistoryGetBaseResponseSchema = AuditSchema.pick({
  updatedAt: true,
  createdAt: true,
})
  .extend({
    id: uuidField,
    salaryStructureId: uuidField,
    changeType: z.enum(EPayrollChangeType),
    previousValues: salaryStructureSchema.nullable(),
    newValues: salaryStructureSchema,
    changedBy: uuidField,
    changedAt: isoDateTimeField,
    reason: z.string().trim().min(1),
    changedByUser: UserSchema,
    isActive: z.boolean(),
  })
  .strict();

export const SalaryStructureHistoryGetResponseSchema = z.array(
  SalaryStructureHistoryGetBaseResponseSchema
);
