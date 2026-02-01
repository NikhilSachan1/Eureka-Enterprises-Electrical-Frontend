import { z } from 'zod';
import {
  ContractorAddRequestSchema,
  ContractorAddResponseSchema,
  ContractorChangeStatusRequestSchema,
  ContractorChangeStatusResponseSchema,
  ContractorDeleteRequestSchema,
  ContractorDeleteResponseSchema,
  ContractorEditRequestSchema,
  ContractorEditResponseSchema,
  ContractorDetailGetRequestSchema,
  ContractorDetailGetResponseSchema,
  ContractorGetBaseResponseSchema,
  ContractorGetRequestSchema,
  ContractorGetResponseSchema,
  ContractorGetStatsResponseSchema,
} from '../schemas';

/*
  Contractor Add
*/
export type IContractorAddRequestDto = z.infer<
  typeof ContractorAddRequestSchema
>;
export type IContractorAddFormDto = z.input<typeof ContractorAddRequestSchema>;
export type IContractorAddResponseDto = z.infer<
  typeof ContractorAddResponseSchema
>;

/*
  Contractor Delete
*/
export type IContractorDeleteRequestDto = z.infer<
  typeof ContractorDeleteRequestSchema
>;
export type IContractorDeleteFormDto = z.input<
  typeof ContractorDeleteRequestSchema
>;
export type IContractorDeleteResponseDto = z.infer<
  typeof ContractorDeleteResponseSchema
>;

/*
  Contractor Edit
*/
export type IContractorEditRequestDto = z.infer<
  typeof ContractorEditRequestSchema
>;
export type IContractorEditFormDto = z.input<
  typeof ContractorEditRequestSchema
>;
export type IContractorEditResponseDto = z.infer<
  typeof ContractorEditResponseSchema
>;

/*
  Contractor Detail Get
*/
export type IContractorDetailGetRequestDto = z.infer<
  typeof ContractorDetailGetRequestSchema
>;
export type IContractorDetailGetFormDto = z.input<
  typeof ContractorDetailGetRequestSchema
>;
export type IContractorDetailGetResponseDto = z.infer<
  typeof ContractorDetailGetResponseSchema
>;

/*
  Contractor Get
*/
export type IContractorGetRequestDto = z.infer<
  typeof ContractorGetRequestSchema
>;
export type IContractorGetFormDto = z.input<typeof ContractorGetRequestSchema>;
export type IContractorGetBaseResponseDto = z.infer<
  typeof ContractorGetBaseResponseSchema
>;
export type IContractorGetResponseDto = z.infer<
  typeof ContractorGetResponseSchema
>;
export type IContractorGetStatsResponseDto = z.infer<
  typeof ContractorGetStatsResponseSchema
>;

/*
  Contractor Change Status
*/
export type IContractorChangeStatusRequestDto = z.infer<
  typeof ContractorChangeStatusRequestSchema
>;
export type IContractorChangeStatusFormDto = z.input<
  typeof ContractorChangeStatusRequestSchema
>;
export type IContractorChangeStatusResponseDto = z.infer<
  typeof ContractorChangeStatusResponseSchema
>;
