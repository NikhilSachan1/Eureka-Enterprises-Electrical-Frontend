import { z } from 'zod';
import {
  EmployeeAddRequestSchema,
  EmployeeAddResponseSchema,
  EmployeeChangeRoleRequestSchema,
  EmployeeChangeRoleResponseSchema,
  EmployeeChangeStatusRequestSchema,
  EmployeeChangeStatusResponseSchema,
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

/*
  Employee Add
*/
export type IEmployeeAddRequestDto = z.infer<typeof EmployeeAddRequestSchema>;
export type IEmployeeAddFormDto = z.input<typeof EmployeeAddRequestSchema>;
export type IEmployeeAddResponseDto = z.infer<typeof EmployeeAddResponseSchema>;

/*
  Employee Get
*/
export type IEmployeeGetRequestDto = z.infer<typeof EmployeeGetRequestSchema>;
export type IEmployeeGetFormDto = z.input<typeof EmployeeGetRequestSchema>;
export type IEmployeeGetResponseDto = z.infer<typeof EmployeeGetResponseSchema>;
export type IEmployeeGetBaseResponseDto = z.infer<
  typeof EmployeeGetBaseResponseSchema
>;
export type IEmployeeGetStatsResponseDto = z.infer<
  typeof EmployeeGetStatsResponseSchema
>;

/*
  Employee Delete
*/
export type IEmployeeDeleteRequestDto = z.infer<
  typeof EmployeeDeleteRequestSchema
>;
export type IEmployeeDeleteFormDto = z.input<
  typeof EmployeeDeleteRequestSchema
>;
export type IEmployeeDeleteResponseDto = z.infer<
  typeof EmployeeDeleteResponseSchema
>;

/*
  Employee Detail Get
*/
export type IEmployeeDetailGetRequestDto = z.infer<
  typeof EmployeeDetailGetRequestSchema
>;
export type IEmployeeDetailGetFormDto = z.input<
  typeof EmployeeDetailGetRequestSchema
>;
export type IEmployeeDetailGetResponseDto = z.infer<
  typeof EmployeeDetailGetResponseSchema
>;

/*
  Employee Get Next Employee Id
*/
export type IEmployeeGetNextEmployeeIdResponseDto = z.infer<
  typeof EmployeeGetNextEmployeeIdResponseSchema
>;

/*
  Employee Send Password Link
*/
export type IEmployeeSendPasswordLinkRequestDto = z.infer<
  typeof EmployeeSendPasswordLinkRequestSchema
>;
export type IEmployeeSendPasswordLinkFormDto = z.input<
  typeof EmployeeSendPasswordLinkRequestSchema
>;
export type IEmployeeSendPasswordLinkResponseDto = z.infer<
  typeof EmployeeSendPasswordLinkResponseSchema
>;

/*
  Employee Edit
*/
export type IEmployeeEditRequestDto = z.infer<typeof EmployeeEditRequestSchema>;
export type IEmployeeEditFormDto = z.input<typeof EmployeeEditRequestSchema>;
export type IEmployeeEditResponseDto = z.infer<
  typeof EmployeeEditResponseSchema
>;

/*
  Employee Change Status
*/
export type IEmployeeChangeStatusRequestDto = z.infer<
  typeof EmployeeChangeStatusRequestSchema
>;
export type IEmployeeChangeStatusFormDto = z.input<
  typeof EmployeeChangeStatusRequestSchema
>;
export type IEmployeeChangeStatusResponseDto = z.infer<
  typeof EmployeeChangeStatusResponseSchema
>;

/*
  Employee Change Role
*/
export type IEmployeeChangeRoleRequestDto = z.infer<
  typeof EmployeeChangeRoleRequestSchema
>;
export type IEmployeeChangeRoleFormDto = z.input<
  typeof EmployeeChangeRoleRequestSchema
>;
export type IEmployeeChangeRoleResponseDto = z.infer<
  typeof EmployeeChangeRoleResponseSchema
>;
