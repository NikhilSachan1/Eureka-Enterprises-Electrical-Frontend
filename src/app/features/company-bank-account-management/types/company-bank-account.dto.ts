import { z } from 'zod';
import {
  CompanyBankAccountAddRequestSchema,
  CompanyBankAccountAddResponseSchema,
  CompanyBankAccountChangeStatusRequestSchema,
  CompanyBankAccountChangeStatusResponseSchema,
  CompanyBankAccountDeleteResponseSchema,
  CompanyBankAccountEditRequestSchema,
  CompanyBankAccountEditResponseSchema,
  CompanyBankAccountGetBaseResponseSchema,
  CompanyBankAccountGetRequestSchema,
  CompanyBankAccountGetResponseSchema,
} from '../schemas';

export type ICompanyBankAccountAddFormDto = z.input<
  typeof CompanyBankAccountAddRequestSchema
>;
export type ICompanyBankAccountAddResponseDto = z.infer<
  typeof CompanyBankAccountAddResponseSchema
>;

export type ICompanyBankAccountEditFormDto = z.input<
  typeof CompanyBankAccountEditRequestSchema
>;
export type ICompanyBankAccountEditResponseDto = z.infer<
  typeof CompanyBankAccountEditResponseSchema
>;

export type ICompanyBankAccountChangeStatusFormDto = z.input<
  typeof CompanyBankAccountChangeStatusRequestSchema
>;
export type ICompanyBankAccountChangeStatusResponseDto = z.infer<
  typeof CompanyBankAccountChangeStatusResponseSchema
>;

export type ICompanyBankAccountDeleteResponseDto = z.infer<
  typeof CompanyBankAccountDeleteResponseSchema
>;

export type ICompanyBankAccountGetFormDto = z.input<
  typeof CompanyBankAccountGetRequestSchema
>;
export type ICompanyBankAccountGetResponseDto = z.infer<
  typeof CompanyBankAccountGetResponseSchema
>;
export type ICompanyBankAccountGetBaseResponseDto = z.infer<
  typeof CompanyBankAccountGetBaseResponseSchema
>;
