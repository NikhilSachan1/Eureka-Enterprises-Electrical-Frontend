import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const VendorBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  contactNumber: z.string().nullable(),
  email: z.string().nullable(),
  gstNumber: z.string().nullable(),
  blockNumber: z.string(),
  streetName: z.string(),
  landmark: z.string(),
  area: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  isActive: z.boolean(),
  vendorType: z.string(),
});

const {
  name,
  email,
  gstNumber,
  blockNumber,
  streetName,
  landmark,
  state,
  city,
} = VendorBaseSchema.shape;

export const VendorUpsertShapeSchema = z
  .object({
    vendorType: z.string().min(1),
    vendorName: name,
    contactNumber: z.string().length(10),
    emailAddress: email,
    vendorGSTNumber: gstNumber,
    blockNumber,
    streetName,
    landmark,
    state,
    city,
    pincode: z.number(),
  })
  .strict();
