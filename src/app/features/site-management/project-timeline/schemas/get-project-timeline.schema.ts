import { isoDateTimeField, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectTimelineGetRequestSchema = z
  .object({
    projectName: uuidField,
  })
  .strict()
  .transform(({ projectName }) => {
    return {
      siteId: projectName,
    };
  });

export const ProjectTimelineGetResponseSchema = z.looseObject({
  timeline: z.array(
    z.looseObject({
      id: uuidField,
      date: isoDateTimeField,
      time: z.string(),
      eventType: z.string(),
      title: z.string(),
      description: z.string(),
      actor: z.string().nullable(),
    })
  ),
});
