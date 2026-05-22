import {
  DsrDetailGetRequestSchema,
  DsrDetailGetResponseSchema,
} from '../schemas/get-dsr-detail.schema';
import {
  DsrAddRequestSchema,
  DsrAddResponseSchema,
  DsrForceRequestSchema,
  DsrForceResponseSchema,
  DsrDeleteResponseSchema,
  DsrEditRequestSchema,
  DsrEditResponseSchema,
  DsrGetBaseResponseSchema,
  DsrGetRequestSchema,
  DsrGetResponseSchema,
} from '../schemas';
import { z } from 'zod';

/*
  Dsr Get
*/
export type IDsrGetRequestDto = z.infer<typeof DsrGetRequestSchema>;
export type IDsrGetFormDto = z.input<typeof DsrGetRequestSchema>;
export type IDsrGetResponseDto = z.infer<typeof DsrGetResponseSchema>;
export type IDsrGetBaseResponseDto = z.infer<typeof DsrGetBaseResponseSchema>;
/*
  Dsr Detail Get
*/
export type IDsrDetailGetRequestDto = z.infer<typeof DsrDetailGetRequestSchema>;
export type IDsrDetailGetFormDto = z.input<typeof DsrDetailGetRequestSchema>;
export type IDsrDetailGetResponseDto = z.infer<
  typeof DsrDetailGetResponseSchema
>;

/*
  Dsr Add
*/
export type IDsrAddRequestDto = z.infer<typeof DsrAddRequestSchema>;
export type IDsrAddFormDto = z.input<typeof DsrAddRequestSchema>;
export type IDsrAddUIFormDto = IDsrAddFormDto;
export type IDsrAddResponseDto = z.infer<typeof DsrAddResponseSchema>;

/*
  Dsr Force
*/
export type IDsrForceRequestDto = z.infer<typeof DsrForceRequestSchema>;
export type IDsrForceFormDto = z.input<typeof DsrForceRequestSchema>;
export type IDsrForceUIFormDto = IDsrForceFormDto;
export type IDsrForceResponseDto = z.infer<typeof DsrForceResponseSchema>;

/*
  Dsr Edit
*/
export type IDsrEditRequestDto = z.infer<typeof DsrEditRequestSchema>;
export type IDsrEditFormDto = z.input<typeof DsrEditRequestSchema>;
export type IDsrEditUIFormDto = IDsrEditFormDto & { projectName: string };
export type IDsrEditResponseDto = z.infer<typeof DsrEditResponseSchema>;

/*
  Dsr Delete
*/
export type IDsrDeleteResponseDto = z.infer<typeof DsrDeleteResponseSchema>;
