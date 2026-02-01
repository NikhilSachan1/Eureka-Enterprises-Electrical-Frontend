import z from 'zod';
import { ContractorUpsertShapeSchema } from './base-contractor.schema';

export const ContractorAddRequestSchema =
  ContractorUpsertShapeSchema.strict().transform(data => {
    return {
      name: data.contractorName,
      contactNumber: data.contactNumber,
      email: data.emailAddress,
      gstNumber: data.contractorGSTNumber,
      blockNumber: data.blockNumber,
      streetName: data.streetName,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: 'India',
    };
  });

export const ContractorAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
