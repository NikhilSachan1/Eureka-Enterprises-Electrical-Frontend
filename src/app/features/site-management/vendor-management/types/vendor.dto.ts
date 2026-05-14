import { z } from 'zod';
import {
  VendorAddRequestSchema,
  VendorAddResponseSchema,
  VendorChangeStatusRequestSchema,
  VendorChangeStatusResponseSchema,
  VendorDeleteRequestSchema,
  VendorDeleteResponseSchema,
  VendorEditRequestSchema,
  VendorEditResponseSchema,
  VendorDetailGetRequestSchema,
  VendorDetailGetResponseSchema,
  VendorGetBaseResponseSchema,
  VendorGetRequestSchema,
  VendorGetResponseSchema,
  VendorGetStatsResponseSchema,
} from '../schemas';

/*
  Vendor Add
*/
export type IVendorAddRequestDto = z.infer<typeof VendorAddRequestSchema>;
export type IVendorAddFormDto = z.input<typeof VendorAddRequestSchema>;
export type IVendorAddResponseDto = z.infer<typeof VendorAddResponseSchema>;

/*
  Vendor Delete
*/
export type IVendorDeleteRequestDto = z.infer<typeof VendorDeleteRequestSchema>;
export type IVendorDeleteFormDto = z.input<typeof VendorDeleteRequestSchema>;
export type IVendorDeleteResponseDto = z.infer<
  typeof VendorDeleteResponseSchema
>;

/*
  Vendor Edit
*/
export type IVendorEditRequestDto = z.infer<typeof VendorEditRequestSchema>;
export type IVendorEditFormDto = z.input<typeof VendorEditRequestSchema>;
export type IVendorEditResponseDto = z.infer<typeof VendorEditResponseSchema>;

/*
  Vendor Detail Get
*/
export type IVendorDetailGetRequestDto = z.infer<
  typeof VendorDetailGetRequestSchema
>;
export type IVendorDetailGetFormDto = z.input<
  typeof VendorDetailGetRequestSchema
>;
export type IVendorDetailGetResponseDto = z.infer<
  typeof VendorDetailGetResponseSchema
>;

/*
  Vendor Get
*/
export type IVendorGetRequestDto = z.infer<typeof VendorGetRequestSchema>;
export type IVendorGetFormDto = z.input<typeof VendorGetRequestSchema>;
export type IVendorGetBaseResponseDto = z.infer<
  typeof VendorGetBaseResponseSchema
>;
export type IVendorGetResponseDto = z.infer<typeof VendorGetResponseSchema>;
export type IVendorGetStatsResponseDto = z.infer<
  typeof VendorGetStatsResponseSchema
>;

/*
  Vendor Change Status
*/
export type IVendorChangeStatusRequestDto = z.infer<
  typeof VendorChangeStatusRequestSchema
>;
export type IVendorChangeStatusFormDto = z.input<
  typeof VendorChangeStatusRequestSchema
>;
export type IVendorChangeStatusResponseDto = z.infer<
  typeof VendorChangeStatusResponseSchema
>;
