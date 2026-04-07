import { z } from 'zod';

export const ProjectChangeStatusRequestSchema = z
  .object({
    projectStatus: z.string(),
    remarks: z.string().nullable(),
  })
  .strict()
  .transform(data => {
    return {
      status: data.projectStatus,
      reason: data.remarks,
    };
  });

export const ProjectChangeStatusResponseSchema = z.looseObject({
  message: z.string(),
});
