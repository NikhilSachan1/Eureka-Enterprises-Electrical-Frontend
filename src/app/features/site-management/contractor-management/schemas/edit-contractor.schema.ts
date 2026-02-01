import z from 'zod';
import { ContractorUpsertShapeSchema } from './base-contractor.schema';

export const ContractorEditRequestSchema =
  ContractorUpsertShapeSchema.strict().transform(data => {
    return {
      name: data.contractorName,
      contactNumber: data.contactNumber?.toString(),
      email: data.emailAddress,
      gstNumber: data.contractorGSTNumber,
      blockNumber: data.blockNumber,
      streetName: data.streetName,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode?.toString(),
      country: 'India',
    };
  });

export const ContractorEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
