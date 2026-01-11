import { z } from 'zod';
import {
  SalaryStructureGetRequestSchema,
  SalaryStructureGetResponseSchema,
  SalaryStructureGetBaseResponseSchema,
  SalaryIncrementAddResponseSchema,
  SalaryIncrementAddRequestSchema,
} from '../schemas';
import {
  SalaryStructureHistoryGetRequestSchema,
  SalaryStructureHistoryGetResponseSchema,
} from '../schemas/get-salary-change-history.schema';

export type ISalaryStructureGetRequestDto = z.infer<
  typeof SalaryStructureGetRequestSchema
>;
export type ISalaryStructureGetRequestInputDto = z.input<
  typeof SalaryStructureGetRequestSchema
>;
export type ISalaryStructureGetResponseDto = z.infer<
  typeof SalaryStructureGetResponseSchema
>;
export type ISalaryStructureGetBaseResponseDto = z.infer<
  typeof SalaryStructureGetBaseResponseSchema
>;

export type ISalaryStructureHistoryGetRequestDto = z.infer<
  typeof SalaryStructureHistoryGetRequestSchema
>;
export type ISalaryStructureHistoryGetResponseDto = z.infer<
  typeof SalaryStructureHistoryGetResponseSchema
>;

export type ISalaryIncrementAddRequestDto = z.infer<
  typeof SalaryIncrementAddRequestSchema
>;
export type ISalaryIncrementAddResponseDto = z.infer<
  typeof SalaryIncrementAddResponseSchema
>;
