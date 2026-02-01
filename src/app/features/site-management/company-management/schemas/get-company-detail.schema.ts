import { UserSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { CompanyGetBaseResponseSchema } from './get-company.schema';
import { makeFieldsNullable } from '@shared/utility';

export const CompanyDetailGetRequestSchema = z
  .object({
    companyId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      ...data,
    };
  });

export const CompanyDetailGetResponseSchema =
  CompanyGetBaseResponseSchema.extend({
    createdByUser: UserSchema,
    updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  });
