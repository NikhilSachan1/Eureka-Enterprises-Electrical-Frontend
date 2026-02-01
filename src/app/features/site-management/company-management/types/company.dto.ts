import { z } from 'zod';
import {
  CompanyAddRequestSchema,
  CompanyAddResponseSchema,
  CompanyChangeStatusRequestSchema,
  CompanyChangeStatusResponseSchema,
  CompanyDeleteRequestSchema,
  CompanyDeleteResponseSchema,
  CompanyDetailGetRequestSchema,
  CompanyDetailGetResponseSchema,
  CompanyEditRequestSchema,
  CompanyEditResponseSchema,
  CompanyGetBaseResponseSchema,
  CompanyGetRequestSchema,
  CompanyGetResponseSchema,
  CompanyGetStatsResponseSchema,
} from '../schemas';

/*
  Company Add
*/
export type ICompanyAddRequestDto = z.infer<typeof CompanyAddRequestSchema>;
export type ICompanyAddFormDto = z.input<typeof CompanyAddRequestSchema>;
export type ICompanyAddResponseDto = z.infer<typeof CompanyAddResponseSchema>;

/*
  Company Delete
*/
export type ICompanyDeleteRequestDto = z.infer<
  typeof CompanyDeleteRequestSchema
>;
export type ICompanyDeleteFormDto = z.input<typeof CompanyDeleteRequestSchema>;
export type ICompanyDeleteResponseDto = z.infer<
  typeof CompanyDeleteResponseSchema
>;

/*
  Company Edit
*/
export type ICompanyEditRequestDto = z.infer<typeof CompanyEditRequestSchema>;
export type ICompanyEditFormDto = z.input<typeof CompanyEditRequestSchema>;
export type ICompanyEditResponseDto = z.infer<typeof CompanyEditResponseSchema>;

/*
  Company Detail Get
*/
export type ICompanyDetailGetRequestDto = z.infer<
  typeof CompanyDetailGetRequestSchema
>;
export type ICompanyDetailGetFormDto = z.input<
  typeof CompanyDetailGetRequestSchema
>;
export type ICompanyDetailGetResponseDto = z.infer<
  typeof CompanyDetailGetResponseSchema
>;

/*
  Company Get
*/
export type ICompanyGetRequestDto = z.infer<typeof CompanyGetRequestSchema>;
export type ICompanyGetFormDto = z.input<typeof CompanyGetRequestSchema>;
export type ICompanyGetBaseResponseDto = z.infer<
  typeof CompanyGetBaseResponseSchema
>;
export type ICompanyGetResponseDto = z.infer<typeof CompanyGetResponseSchema>;
export type ICompanyGetStatsResponseDto = z.infer<
  typeof CompanyGetStatsResponseSchema
>;

/*
  Company Change Status
*/
export type ICompanyChangeStatusRequestDto = z.infer<
  typeof CompanyChangeStatusRequestSchema
>;
export type ICompanyChangeStatusFormDto = z.input<
  typeof CompanyChangeStatusRequestSchema
>;
export type ICompanyChangeStatusResponseDto = z.infer<
  typeof CompanyChangeStatusResponseSchema
>;
