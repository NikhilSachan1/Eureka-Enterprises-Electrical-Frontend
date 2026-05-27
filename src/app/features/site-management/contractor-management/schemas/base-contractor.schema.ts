import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ContractorBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  contactNumber: z.string(),
  email: z.string(),
  gstNumber: z.string().nullable(),
  blockNumber: z.string().nullable(),
  buildingName: z.string().nullable(),
  streetName: z.string().nullable(),
  landmark: z.string().nullable(),
  area: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().nullable(),
  country: z.string(),
  remarks: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
  accountHolderName: z.string().nullable(),
  isActive: z.boolean(),
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
  pincode,
  contactNumber,
} = ContractorBaseSchema.shape;

export const ContractorUpsertShapeSchema = z
  .object({
    contractorName: name,
    contactNumber,
    emailAddress: email,
    contractorGSTNumber: gstNumber,
    blockNumber,
    streetName,
    landmark,
    state,
    city,
    pincode,
  })
  .strict();
