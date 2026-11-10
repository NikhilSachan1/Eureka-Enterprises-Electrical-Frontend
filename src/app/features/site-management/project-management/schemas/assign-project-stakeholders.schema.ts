import { uuidField } from '@shared/schemas';
import * as z from 'zod';

export const ProjectAssignStakeholdersRequestSchema = z
  .object({
    vendorNames: z.array(uuidField).nullable(),
  })
  .strict()
  .transform(data => {
    return {
      vendorIds: data.vendorNames ?? [],
    };
  });
