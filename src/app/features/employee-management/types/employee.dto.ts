import { z } from 'zod';
import {
  EmployeeAddRequestSchema,
  EmployeeAddResponseSchema,
  EmployeeDeleteRequestSchema,
  EmployeeDeleteResponseSchema,
  EmployeeDetailGetRequestSchema,
  EmployeeDetailGetResponseSchema,
  EmployeeEditRequestSchema,
  EmployeeEditResponseSchema,
  EmployeeGetBaseResponseSchema,
  EmployeeGetNextEmployeeIdResponseSchema,
  EmployeeGetRequestSchema,
  EmployeeGetResponseSchema,
  EmployeeGetStatsResponseSchema,
  EmployeeSendPasswordLinkRequestSchema,
  EmployeeSendPasswordLinkResponseSchema,
} from '../schemas';

export type IEmployeeAddRequestDto = z.infer<typeof EmployeeAddRequestSchema>;
export type IEmployeeAddResponseDto = z.infer<typeof EmployeeAddResponseSchema>;
export type IEmployeeGetRequestDto = z.infer<typeof EmployeeGetRequestSchema>;
export type IEmployeeGetResponseDto = z.infer<typeof EmployeeGetResponseSchema>;
export type IEmployeeGetBaseResponseDto = z.infer<
  typeof EmployeeGetBaseResponseSchema
>;
export type IEmployeeGetStatsResponseDto = z.infer<
  typeof EmployeeGetStatsResponseSchema
>;
export type IEmployeeDeleteRequestDto = z.infer<
  typeof EmployeeDeleteRequestSchema
>;
export type IEmployeeDeleteResponseDto = z.infer<
  typeof EmployeeDeleteResponseSchema
>;
export type IEmployeeDetailGetRequestDto = z.infer<
  typeof EmployeeDetailGetRequestSchema
>;
export type IEmployeeDetailGetResponseDto = z.infer<
  typeof EmployeeDetailGetResponseSchema
>;
export type IEmployeeGetNextEmployeeIdResponseDto = z.infer<
  typeof EmployeeGetNextEmployeeIdResponseSchema
>;
export type IEmployeeSendPasswordLinkRequestDto = z.infer<
  typeof EmployeeSendPasswordLinkRequestSchema
>;
export type IEmployeeSendPasswordLinkResponseDto = z.infer<
  typeof EmployeeSendPasswordLinkResponseSchema
>;
export type IEmployeeEditRequestDto = z.infer<typeof EmployeeEditRequestSchema>;
export type IEmployeeEditResponseDto = z.infer<
  typeof EmployeeEditResponseSchema
>;
