import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const VendorBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  contactNumber: z.string().nullable(),
  email: z.string().nullable(),
  gstNumber: z.string().nullable(),
  blockNumber: z.string().nullable(),
  streetName: z.string().nullable(),
  landmark: z.string().nullable(),
  area: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
  accountHolderName: z.string().nullable(),
  isActive: z.boolean(),
  vendorType: z.string(),
});

const {
  name,
  gstNumber,
  blockNumber,
  streetName,
  landmark,
  state,
  city,
  pincode,
  email,
  bankName,
  accountNumber,
  ifscCode,
  accountHolderName,
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
    pincode,
    bankName,
    accountNumber,
    ifscCode,
    accountHolderName,
  })
  .strict();
