import { z } from 'zod';
import {
  EmployeeAddRequestSchema,
  EmployeeAddResponseSchema,
  EmployeeGetBaseResponseSchema,
  EmployeeGetRequestSchema,
  EmployeeGetResponseSchema,
  EmployeeGetStatsResponseSchema,
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
