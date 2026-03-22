import {
  ConfigurationGetBaseResponseSchema,
  ConfigurationGetRequestSchema,
  ConfigurationGetResponseSchema,
} from '../schemas';
import { z } from 'zod';

/*
  Configuration Get
*/
export type IConfigurationGetRequestDto = z.infer<
  typeof ConfigurationGetRequestSchema
>;
export type IConfigurationGetFormDto = z.input<
  typeof ConfigurationGetRequestSchema
>;
export type IConfigurationGetResponseDto = z.infer<
  typeof ConfigurationGetResponseSchema
>;
export type IConfigurationGetBaseResponseDto = z.infer<
  typeof ConfigurationGetBaseResponseSchema
>;
