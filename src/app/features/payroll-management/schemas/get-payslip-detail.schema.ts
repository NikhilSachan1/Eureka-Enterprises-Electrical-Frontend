import { z } from 'zod';
import { PayslipGetBaseResponseSchema } from './get-payslip.schema';
import { UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

export const PayslipDetailGetRequestSchema = z.object({
  payslipId: uuidField,
});

export const PayslipDetailGetResponseSchema =
  PayslipGetBaseResponseSchema.extend({
    approver: makeFieldsNullable(UserSchema).nullable(),
  }).strict();
