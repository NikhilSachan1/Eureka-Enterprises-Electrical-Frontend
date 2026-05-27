import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const CompanyBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  website: z.string().nullable(),
  logo: z.string().nullable(),
  buildingName: z.string().nullable(),
  area: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().nullable(),
  country: z.string(),
  parentCompanyId: uuidField.nullable(),
  remarks: z.string().nullable(),
  isActive: z.boolean(),
});

const { name, state, city, pincode, parentCompanyId } = CompanyBaseSchema.shape;

export const CompanyUpsertShapeSchema = z
  .object({
    companyName: name,
    state,
    city,
    pincode,
    parentCompanyName: parentCompanyId,
  })
  .strict();
