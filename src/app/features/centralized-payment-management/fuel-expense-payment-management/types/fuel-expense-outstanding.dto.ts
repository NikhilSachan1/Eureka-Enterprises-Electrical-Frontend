import { z } from 'zod';
import {
  FuelExpenseOutstandingGetBaseResponseSchema,
  FuelExpenseOutstandingGetRequestSchema,
  FuelExpenseOutstandingGetResponseSchema,
  FuelExpenseOutstandingGetStatsResponseSchema,
} from '../schemas';

export type IFuelExpenseOutstandingGetBaseResponseDto = z.infer<
  typeof FuelExpenseOutstandingGetBaseResponseSchema
>;
export type IFuelExpenseOutstandingGetStatsResponseDto = z.infer<
  typeof FuelExpenseOutstandingGetStatsResponseSchema
>;
export type IFuelExpenseOutstandingGetResponseDto = z.infer<
  typeof FuelExpenseOutstandingGetResponseSchema
>;
export type IFuelExpenseOutstandingGetFormDto = z.input<
  typeof FuelExpenseOutstandingGetRequestSchema
>;
