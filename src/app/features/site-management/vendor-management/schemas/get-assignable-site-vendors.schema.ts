import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const AssignableSiteVendorSiteSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
});

export const AssignableSiteVendorsGetResponseSchema = z.looseObject({
  allowed: z.boolean(),
  sites: z.array(AssignableSiteVendorSiteSchema),
});
