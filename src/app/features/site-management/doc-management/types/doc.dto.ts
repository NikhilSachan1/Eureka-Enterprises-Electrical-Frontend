import {
  DocAddRequestSchema,
  DocAddResponseSchema,
  DocDeleteResponseSchema,
  DocEditRequestSchema,
  DocEditResponseSchema,
  DocGetBaseResponseSchema,
  DocGetRequestSchema,
  DocGetResponseSchema,
} from '../schemas';
import { z } from 'zod';

/*
  Doc Get
*/
export type IDocGetRequestDto = z.infer<typeof DocGetRequestSchema>;
export type IDocGetFormDto = z.input<typeof DocGetRequestSchema>;
export type IDocGetResponseDto = z.infer<typeof DocGetResponseSchema>;
export type IDocGetBaseResponseDto = z.infer<typeof DocGetBaseResponseSchema>;

/*
  Doc Add
*/
export type IDocAddRequestDto = z.infer<typeof DocAddRequestSchema>;
export type IDocAddFormDto = z.input<typeof DocAddRequestSchema>;
export type IDocAddUIFormDto = Omit<IDocAddFormDto, 'projectName'>;
export type IDocAddResponseDto = z.infer<typeof DocAddResponseSchema>;

/*
  Doc Edit
*/
export type IDocEditRequestDto = z.infer<typeof DocEditRequestSchema>;
export type IDocEditFormDto = z.input<typeof DocEditRequestSchema>;
export type IDocEditUIFormDto = Omit<IDocEditFormDto, 'projectName'>;
export type IDocEditResponseDto = z.infer<typeof DocEditResponseSchema>;

/*
  Doc Delete
*/
export type IDocDeleteResponseDto = z.infer<typeof DocDeleteResponseSchema>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IDocPOUIFormDto = {
  contractorName: string;
  poNumber: string;
  poDate: Date;
  poTaxableAmount: number;
  poGstAmount: number;
  poTotalAmount: number;
  poAttachments: File[];
  poRemark: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IDocJMCUIFormDto = {
  poId: string;
  jmcNumber: string;
  jmcDate: Date;
  jmcAttachments: File[];
  jmcRemark: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IDocReportUIFormDto = {
  jmcId: string;
  reportNumber: string;
  reportDate: Date;
  reportAttachments: File[];
  reportRemark: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IDocInvoiceUIFormDto = {
  jmcId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceTaxableAmount: number;
  invoiceGstAmount: number;
  invoiceTotalAmount: number;
  invoiceAttachments: File[];
  invoiceRemark: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IDocPaymentUIFormDto = {
  invoiceId: string;
  transactionId: string;
  paymentDate: Date;
  paymentTaxableAmount: number;
  paymentGstAmount: number;
  paymentTdsDeductionAmount: number;
  paymentTotalAmount: number;
  transactionReceipt: File;
  transactionRemark: string;
  paymentHoldReason: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IDocPaymentAdviceUIFormDto = {
  paymentId: string;
  paymentAdviceNumber: string;
  paymentAdviceDate: Date;
  paymentAdviceAttachments: File[];
  paymentAdviceRemark: string;
};
