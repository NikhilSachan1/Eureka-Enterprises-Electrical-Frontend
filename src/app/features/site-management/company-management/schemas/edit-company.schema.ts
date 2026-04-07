import z from 'zod';
import { CompanyUpsertShapeSchema } from './base-company.schema';

export const CompanyEditRequestSchema =
  CompanyUpsertShapeSchema.strict().transform(data => {
    return {
      name: data.companyName,
      contactNumber: data.contactNumber,
      email: data.emailAddress,
      gstNumber: data.companyGSTNumber,
      blockNumber: data.blockNumber,
      streetName: data.streetName,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: 'India',
      parentCompanyId: data.parentCompanyName,
    };
  });

export const CompanyEditResponseSchema = z.looseObject({
  message: z.string(),
});
