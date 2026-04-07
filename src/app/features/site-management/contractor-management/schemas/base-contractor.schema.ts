import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ContractorBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  contactNumber: z.string().nullable(),
  email: z.string().nullable(),
  gstNumber: z.string().nullable(),
  blockNumber: z.string(),
  buildingName: z.string().nullable(),
  streetName: z.string(),
  landmark: z.string(),
  area: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
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
} = ContractorBaseSchema.shape;

export const ContractorUpsertShapeSchema = z
  .object({
    contractorName: name,
    contactNumber: z.number().nullable(),
    emailAddress: email,
    contractorGSTNumber: gstNumber,
    blockNumber,
    streetName,
    landmark,
    state,
    city,
    pincode: z.number().nullable(),
  })
  .strict();
