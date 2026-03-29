import {
  ConfigurationAddRequestSchema,
  ConfigurationAddResponseSchema,
  ConfigurationDetailGetRequestSchema,
  ConfigurationDetailGetResponseSchema,
  ConfigurationGetBaseResponseSchema,
  ConfigurationGetRequestSchema,
  ConfigurationGetResponseSchema,
} from '../schemas';
import { z } from 'zod';
import {
  ConfigurationEditRequestSchema,
  ConfigurationEditResponseSchema,
} from '../schemas/edit-configuration.schema';

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
export type IConfigurationAddUIFormDto = Omit<
  IConfigurationAddFormDto,
  'configValue'
>;
export type IConfigurationAddResponseDto = z.infer<
  typeof ConfigurationAddResponseSchema
>;

/*
  Configuration Edit
*/
export type IConfigurationEditRequestDto = z.infer<
  typeof ConfigurationEditRequestSchema
>;
export type IConfigurationEditFormDto = z.input<
  typeof ConfigurationEditRequestSchema
>;
export type IConfigurationEditUIFormDto = Omit<
  IConfigurationEditFormDto,
  'configValue'
>;
export type IConfigurationEditResponseDto = z.infer<
  typeof ConfigurationEditResponseSchema
>;

/*
  Configuration Detail
*/
export type IConfigurationDetailGetRequestDto = z.infer<
  typeof ConfigurationDetailGetRequestSchema
>;
export type IConfigurationDetailGetFormDto = z.input<
  typeof ConfigurationDetailGetRequestSchema
>;
export type IConfigurationDetailGetResponseDto = z.infer<
  typeof ConfigurationDetailGetResponseSchema
>;
