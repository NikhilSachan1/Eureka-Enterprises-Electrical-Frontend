import { z } from 'zod';

const DsrVersionUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

const DsrVersionFileSchema = z.object({
  id: z.string(),
  fileKey: z.string(),
  fileName: z.string(),
  fileType: z.string(),
});

export const DsrVersionItemSchema = z.object({
  id: z.string(),
  versionNumber: z.number(),
  isActive: z.boolean(),
  editReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: DsrVersionUserSchema.nullable(),
  updatedBy: DsrVersionUserSchema.nullable(),
  workTypes: z.array(z.string()).nullable(),
  workDescription: z.string().nullable(),
  challenges: z.string().nullable(),
  weatherCondition: z.string().nullable(),
  manpowerCount: z.union([z.number(), z.string()]).nullable(),
  hoursWorked: z.string().nullable(),
  remarks: z.string().nullable(),
  files: z.array(DsrVersionFileSchema).nullable(),
});

export const DsrVersionsGetResponseSchema = z.array(DsrVersionItemSchema);
