import {
  ConfigurationAddRequestSchema,
  ConfigurationAddResponseSchema,
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

/*
  Configuration Add
*/
export type IConfigurationAddRequestDto = z.infer<
  typeof ConfigurationAddRequestSchema
>;
export type IConfigurationAddFormDto = z.input<
  typeof ConfigurationAddRequestSchema
>;
export type IConfigurationAddResponseDto = z.infer<
  typeof ConfigurationAddResponseSchema
>;
