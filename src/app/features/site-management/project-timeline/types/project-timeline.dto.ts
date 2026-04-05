import {
  ProjectTimelineGetRequestSchema,
  ProjectTimelineGetResponseSchema,
} from '../schemas/get-project-timeline.schema';
import { z } from 'zod';

export type IProjectTimelineGetRequestDto = z.infer<
  typeof ProjectTimelineGetRequestSchema
>;
export type IProjectTimelineGetFormDto = z.input<
  typeof ProjectTimelineGetRequestSchema
>;
export type IProjectTimelineGetResponseDto = z.infer<
  typeof ProjectTimelineGetResponseSchema
>;
