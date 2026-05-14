import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { VendorBaseSchema } from './base-vendor.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const VendorGetRequestSchema = z
  .object({
    vendorState: z.array(z.string()).optional(),
    vendorCity: z.array(z.string()).optional(),
    vendorStatus: z.string().optional(),
    vendorType: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({ vendorState, vendorCity, vendorStatus, vendorType, ...rest }) => {
      return {
        ...rest,
        city: vendorCity,
        state: vendorState,
        isActive: vendorStatus,
        vendorType,
      };
    }
  );

export const VendorGetBaseResponseSchema = VendorBaseSchema.extend({
  ...AuditSchema.shape,
  fullAddress: z.string().nullable(),
}).loose();

export const VendorGetStatsResponseSchema = z.looseObject({
  totalVendors: z.number().int().nonnegative(),
  activeVendors: z.number().int().nonnegative(),
  archivedVendors: z.number().int().nonnegative(),
  inactiveVendors: z.number().int().nonnegative(),
  freelancerVendors: z.number().int().nonnegative(),
  gstRegisteredVendors: z.number().int().nonnegative(),
});

export const VendorGetResponseSchema = z.looseObject({
  records: z.array(VendorGetBaseResponseSchema),
  overallStats: VendorGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
