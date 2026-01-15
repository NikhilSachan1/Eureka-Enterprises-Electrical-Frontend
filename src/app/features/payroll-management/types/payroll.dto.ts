import { z } from 'zod';
import {
  SalaryStructureGetRequestSchema,
  SalaryStructureGetResponseSchema,
  SalaryStructureGetBaseResponseSchema,
  SalaryIncrementAddResponseSchema,
  SalaryIncrementAddRequestSchema,
  SalaryEditRequestSchema,
  SalaryEditResponseSchema,
  PayslipGetRequestSchema,
  PayslipGetResponseSchema,
  PayslipGetBaseResponseSchema,
  PayslipDetailGetResponseSchema,
  PayslipDetailGetRequestSchema,
  ActionPayrollResponseSchema,
  ActionPayrollRequestSchema,
  GeneratePayrollResponseSchema,
  GeneratePayrollRequestSchema,
} from '../schemas';
import {
  SalaryStructureHistoryGetRequestSchema,
  SalaryStructureHistoryGetResponseSchema,
} from '../schemas/get-salary-change-history.schema';

/**
 * Salary Structure History
 */
export type ISalaryStructureHistoryGetFormDto = z.input<
  typeof SalaryStructureHistoryGetRequestSchema
>;
export type ISalaryStructureHistoryGetRequestDto = z.infer<
  typeof SalaryStructureHistoryGetRequestSchema
>;
export type ISalaryStructureHistoryGetResponseDto = z.infer<
  typeof SalaryStructureHistoryGetResponseSchema
>;

/**
 * Salary Structure
 */

export type ISalaryStructureGetRequestDto = z.infer<
  typeof SalaryStructureGetRequestSchema
>;
export type ISalaryStructureGetFormDto = z.input<
  typeof SalaryStructureGetRequestSchema
>;
export type ISalaryStructureGetResponseDto = z.infer<
  typeof SalaryStructureGetResponseSchema
>;
export type ISalaryStructureGetBaseResponseDto = z.infer<
  typeof SalaryStructureGetBaseResponseSchema
>;

/**
 * Salary Increment
 */
export type ISalaryIncrementAddRequestDto = z.infer<
  typeof SalaryIncrementAddRequestSchema
>;
export type ISalaryIncrementAddFormDto = z.input<
  typeof SalaryIncrementAddRequestSchema
>;
export type ISalaryIncrementAddResponseDto = z.infer<
  typeof SalaryIncrementAddResponseSchema
>;

/**
 * Salary Edit
 */
export type ISalaryEditRequestDto = z.infer<typeof SalaryEditRequestSchema>;
export type ISalaryEditFormDto = z.input<typeof SalaryEditRequestSchema>;
export type ISalaryEditResponseDto = z.infer<typeof SalaryEditResponseSchema>;

/**
 * Payslip
 */
export type IPayslipGetRequestDto = z.infer<typeof PayslipGetRequestSchema>;
export type IPayslipGetFormDto = z.input<typeof PayslipGetRequestSchema>;
export type IPayslipGetResponseDto = z.infer<typeof PayslipGetResponseSchema>;
export type IPayslipGetBaseResponseDto = z.infer<
  typeof PayslipGetBaseResponseSchema
>;

/**
 * Payslip Detail
 */
export type IPayslipDetailGetRequestDto = z.infer<
  typeof PayslipDetailGetRequestSchema
>;
export type IPayslipDetailGetFormDto = z.input<
  typeof PayslipDetailGetRequestSchema
>;
export type IPayslipDetailGetResponseDto = z.infer<
  typeof PayslipDetailGetResponseSchema
>;

/**
 * Action Payroll
 */
export type IActionPayrollRequestDto = z.infer<
  typeof ActionPayrollRequestSchema
>;
export type IActionPayrollFormDto = z.input<typeof ActionPayrollRequestSchema>;
export type IActionPayrollResponseDto = z.infer<
  typeof ActionPayrollResponseSchema
>;

/**
 * Generate Payroll
 */
export type IGeneratePayrollRequestDto = z.infer<
  typeof GeneratePayrollRequestSchema
>;
export type IGeneratePayrollFormDto = z.input<
  typeof GeneratePayrollRequestSchema
>;
export type IGeneratePayrollResponseDto = z.infer<
  typeof GeneratePayrollResponseSchema
>;
