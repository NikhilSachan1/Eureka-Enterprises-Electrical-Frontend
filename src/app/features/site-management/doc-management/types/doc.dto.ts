import {
  DocAddRequestSchema,
  DocAddResponseSchema,
  DocDeleteResponseSchema,
  DocEditRequestSchema,
  DocEditResponseSchema,
  DocGetBaseResponseSchema,
  DocGetRequestSchema,
  DocGetResponseSchema,
} from '../schemas';
import { z } from 'zod';

/*
  Doc Get
*/
export type IDocGetRequestDto = z.infer<typeof DocGetRequestSchema>;
export type IDocGetFormDto = z.input<typeof DocGetRequestSchema>;
export type IDocGetResponseDto = z.infer<typeof DocGetResponseSchema>;
export type IDocGetBaseResponseDto = z.infer<typeof DocGetBaseResponseSchema>;

/*
  Doc Add
*/
export type IDocAddRequestDto = z.infer<typeof DocAddRequestSchema>;
export type IDocAddFormDto = z.input<typeof DocAddRequestSchema>;
export type IDocAddUIFormDto = Omit<IDocAddFormDto, 'projectName'>;
export type IDocAddResponseDto = z.infer<typeof DocAddResponseSchema>;

/*
  Doc Edit
*/
export type IDocEditRequestDto = z.infer<typeof DocEditRequestSchema>;
export type IDocEditFormDto = z.input<typeof DocEditRequestSchema>;
export type IDocEditUIFormDto = Omit<IDocEditFormDto, 'projectName'>;
export type IDocEditResponseDto = z.infer<typeof DocEditResponseSchema>;

/*
  Doc Delete
*/
export type IDocDeleteResponseDto = z.infer<typeof DocDeleteResponseSchema>;
