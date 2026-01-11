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
    id: uuidField,
  })
  .strict();

export const SalaryStructureHistoryGetBaseResponseSchema = z
  .object({
    id: uuidField,
    salaryStructureId: uuidField,
    changeType: z.enum(EPayrollChangeType),
    previousValues: salaryStructureSchema.nullable(),
    newValues: salaryStructureSchema.extend({
      effectiveFrom: z.string(), //ToDo Remove explicit string type once backend is updated
    }),
    changedBy: uuidField,
    changedAt: isoDateTimeField,
    reason: z.string().trim().min(1),
    changedByUser: UserSchema,
    ...AuditSchema.shape,
  })
  .strict();

export const SalaryStructureHistoryGetResponseSchema = z.array(
  SalaryStructureHistoryGetBaseResponseSchema
);
