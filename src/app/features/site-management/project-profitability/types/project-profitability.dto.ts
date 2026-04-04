import { z } from 'zod';
import {
  ProjectProfitabilityGetRequestSchema,
  ProjectProfitabilityGetResponseSchema,
} from '../schemas/get-project-profitability.schema';

export type IProjectProfitabilityGetRequestDto = z.infer<
  typeof ProjectProfitabilityGetRequestSchema
>;
export type IProjectProfitabilityGetFormDto = z.input<
  typeof ProjectProfitabilityGetRequestSchema
>;
export type IProjectProfitabilityGetResponseDto = z.infer<
  typeof ProjectProfitabilityGetResponseSchema
>;
