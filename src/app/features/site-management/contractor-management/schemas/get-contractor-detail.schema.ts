import { UserSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { makeFieldsNullable } from '@shared/utility';
import { ContractorGetBaseResponseSchema } from './get-contractor.schema';

export const ContractorDetailGetRequestSchema = z
  .object({
    contractorId: uuidField,
  })
  .strict();

export const ContractorDetailGetResponseSchema =
  ContractorGetBaseResponseSchema.extend({
    createdByUser: makeFieldsNullable(UserSchema).nullable(),
    updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  });
