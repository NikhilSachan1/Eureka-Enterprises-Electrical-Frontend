import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const CompanyBaseSchema = z
  .object({
    id: uuidField,
    name: z.string(),
    website: z.string().nullable(),
    logo: z.string().nullable(),
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
    parentCompanyId: uuidField.nullable(),
    remarks: z.string().nullable(),
    isActive: z.boolean(),
  })
  .strict();

const {
  name,
  email,
  gstNumber,
  blockNumber,
  streetName,
  landmark,
  state,
  city,
  parentCompanyId,
} = CompanyBaseSchema.shape;

export const CompanyUpsertShapeSchema = z
  .object({
    companyName: name,
    contactNumber: z.number().nullable(),
    emailAddress: email,
    companyGSTNumber: gstNumber,
    blockNumber,
    streetName,
    landmark,
    state,
    city,
    pincode: z.number().nullable(),
    parentCompanyName: parentCompanyId,
  })
  .strict();
