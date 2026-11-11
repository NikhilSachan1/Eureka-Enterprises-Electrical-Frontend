import {
  ConfigSettingAddRequestSchema,
  ConfigSettingEditRequestSchema,
  ConfigSettingUpsertResponseSchema,
  ConfigurationAddRequestSchema,
  ConfigurationAddResponseSchema,
  ConfigurationDeleteResponseSchema,
  ConfigurationDetailGetRequestSchema,
  ConfigurationDetailGetResponseSchema,
  ConfigurationEditRequestSchema,
  ConfigurationEditResponseSchema,
  ConfigurationGetBaseResponseSchema,
  ConfigurationGetRequestSchema,
  ConfigurationGetResponseSchema,
  ConfigurationUpsertShapeSchema,
} from '../schemas';
import * as z from 'zod';

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
  Configuration Edit (metadata PATCH + active setting PATCH/POST)
*/
export type IConfigurationEditRequestDto = z.infer<
  typeof ConfigurationEditRequestSchema
>;
export type IConfigurationEditFormDto = z.input<
  typeof ConfigurationEditRequestSchema
>;
/** Full edit form: metadata + active setting fields (value is edited separately). */
export type IConfigurationEditUIFormDto = Omit<
  z.input<typeof ConfigurationUpsertShapeSchema>,
  'configValue'
>;
export type IConfigurationEditResponseDto = z.infer<
  typeof ConfigurationEditResponseSchema
>;

export type IConfigSettingEditFormDto = z.input<
  typeof ConfigSettingEditRequestSchema
>;
export type IConfigSettingAddFormDto = z.input<
  typeof ConfigSettingAddRequestSchema
>;
export type IConfigSettingUpsertResponseDto = z.infer<
  typeof ConfigSettingUpsertResponseSchema
>;

/*
  Configuration Delete
*/
export type IConfigurationDeleteResponseDto = z.infer<
  typeof ConfigurationDeleteResponseSchema
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
