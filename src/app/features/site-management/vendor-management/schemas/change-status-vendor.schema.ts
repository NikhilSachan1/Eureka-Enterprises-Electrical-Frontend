import { z } from 'zod';
import { EVendorStatus } from '../types/vendor.enum';
import { VendorEditResponseSchema } from './edit-vendor.schema';

export const VendorChangeStatusRequestSchema = z
  .object({
    vendorStatus: z.string(),
  })
  .strict()
  .transform(data => ({
    isActive: data.vendorStatus === EVendorStatus.ACTIVE ? true : false,
  }));

export const VendorChangeStatusResponseSchema = VendorEditResponseSchema;
