import { UserSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { makeFieldsNullable } from '@shared/utility';
import { VendorGetBaseResponseSchema } from './get-vendor.schema';

export const VendorDetailGetRequestSchema = z
  .object({
    vendorId: uuidField,
  })
  .strict();

export const VendorDetailGetResponseSchema = VendorGetBaseResponseSchema.extend(
  {
    createdByUser: makeFieldsNullable(UserSchema).nullable(),
    updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  }
);
