import { z } from 'zod';
import {
  VendorOutstandingGetBaseResponseSchema,
  VendorOutstandingGetRequestSchema,
  VendorOutstandingGetResponseSchema,
  VendorOutstandingGetStatsResponseSchema,
} from '../schemas';

export type IVendorOutstandingGetBaseResponseDto = z.infer<
  typeof VendorOutstandingGetBaseResponseSchema
>;
export type IVendorOutstandingGetStatsResponseDto = z.infer<
  typeof VendorOutstandingGetStatsResponseSchema
>;
export type IVendorOutstandingGetResponseDto = z.infer<
  typeof VendorOutstandingGetResponseSchema
>;
export type IVendorOutstandingGetFormDto = z.input<
  typeof VendorOutstandingGetRequestSchema
>;
