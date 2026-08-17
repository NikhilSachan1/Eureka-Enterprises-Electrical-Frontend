import { z } from 'zod';
import {
  PoBreakdownGetRequestSchema,
  PoBreakdownGetResponseSchema,
  PoBreakdownRecordSchema,
} from '../schemas/get-po-breakdown.schema';

export type IPoBreakdownGetFormDto = z.input<typeof PoBreakdownGetRequestSchema>;
export type IPoBreakdownGetRecordDto = z.infer<typeof PoBreakdownRecordSchema>;
export type IPoBreakdownGetResponseDto = z.infer<
  typeof PoBreakdownGetResponseSchema
>;
