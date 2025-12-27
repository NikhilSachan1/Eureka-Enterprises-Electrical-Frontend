import {
  AppConfiguationRequestSchema,
  AppConfiguationResponseSchema,
} from '@shared/schemas';
import z from 'zod';

export type IAppConfiguationRequestDto = z.infer<
  typeof AppConfiguationRequestSchema
>;

export type IAppConfiguationResponseDto = z.infer<
  typeof AppConfiguationResponseSchema
>;
