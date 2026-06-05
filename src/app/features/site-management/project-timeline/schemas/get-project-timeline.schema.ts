import { onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectTimelineGetRequestSchema = z
  .object({
    limit: z.number().default(50),
  })
  .strict()
  .transform(({ limit }) => {
    return { limit };
  });

export const ProjectTimelineGetResponseSchema = z.looseObject({
  timeline: z.array(
    z.looseObject({
      id: uuidField,
      date: onlyDateStringField,
      time: z.string().nullable(),
      eventType: z.string(),
      title: z.string(),
      description: z.string(),
      actor: z.string().nullable(),
    })
  ),
});
