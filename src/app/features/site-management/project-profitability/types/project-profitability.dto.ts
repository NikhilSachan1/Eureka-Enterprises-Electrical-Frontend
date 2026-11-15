import * as z from 'zod';
import {
  ProjectProfitabilityGetRequestSchema,
  ProjectProfitabilityGetResponseSchema,
} from '../schemas/get-project-profitability.schema';
import {
  ProjectsPnlSummaryGetRequestSchema,
  ProjectsPnlSummaryGetResponseSchema,
} from '../schemas/get-projects-pnl-summary.schema';

export type IProjectProfitabilityGetRequestDto = z.infer<
  typeof ProjectProfitabilityGetRequestSchema
>;
export type IProjectProfitabilityGetFormDto = z.input<
  typeof ProjectProfitabilityGetRequestSchema
>;
export type IProjectProfitabilityGetResponseDto = z.infer<
  typeof ProjectProfitabilityGetResponseSchema
>;

export type IProjectsPnlSummaryGetFormDto = z.input<
  typeof ProjectsPnlSummaryGetRequestSchema
>;
export type IProjectsPnlSummaryGetResponseDto = z.infer<
  typeof ProjectsPnlSummaryGetResponseSchema
>;
export type IProjectPnlSummary =
  IProjectsPnlSummaryGetResponseDto['items'][number];
