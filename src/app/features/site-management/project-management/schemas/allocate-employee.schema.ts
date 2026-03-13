import { z } from 'zod';
import { uuidField, onlyDateStringField } from '@shared/schemas';

const AllocationItemSchema = z.object({
  siteId: uuidField,
  userId: uuidField,
  allocatedAt: onlyDateStringField,
  role: z.string().min(1),
  allocationType: z.string().min(1),
  dailyAllowance: z.number().optional(),
});

const DeallocationItemSchema = z.object({
  allocationId: uuidField,
  deallocatedAt: onlyDateStringField,
  remarks: z.string().optional(),
});

export const ManageAllocationsRequestSchema = z
  .object({
    allocations: z.array(AllocationItemSchema).default([]),
    deallocations: z.array(DeallocationItemSchema).default([]),
  })
  .strict();

const AllocationResultSchema = z.object({
  userId: uuidField,
  siteId: uuidField,
  success: z.boolean(),
  message: z.string(),
});

const DeallocationResultSchema = z.object({
  allocationId: uuidField,
  success: z.boolean(),
  message: z.string(),
});

const AllocationOperationsSchema = z.object({
  totalRequested: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failureCount: z.number().int().nonnegative(),
  results: z.array(AllocationResultSchema),
});

const DeallocationOperationsSchema = z.object({
  totalRequested: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failureCount: z.number().int().nonnegative(),
  results: z.array(DeallocationResultSchema),
});

export const ManageAllocationsResponseSchema = z
  .object({
    message: z.string(),
    allocations: AllocationOperationsSchema,
    deallocations: DeallocationOperationsSchema,
  })
  .strict();
