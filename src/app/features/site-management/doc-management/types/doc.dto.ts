import {
  DocDeleteResponseSchema,
  DocGetBaseResponseSchema,
  DocGetRequestSchema,
  DocGetResponseSchema,
  InvoiceDocAddRequestSchema,
  InvoiceDocAddResponseSchema,
  JmcDocAddRequestSchema,
  JmcDocAddResponseSchema,
  PaymentAdviceDocAddRequestSchema,
  PaymentAdviceDocAddResponseSchema,
  PaymentDocAddRequestSchema,
  PaymentDocAddResponseSchema,
  PoDocAddRequestSchema,
  PoDocAddResponseSchema,
  ReportDocAddRequestSchema,
  ReportDocAddResponseSchema,
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
  PO Doc Add
*/
export type IPoDocAddRequestDto = z.infer<typeof PoDocAddRequestSchema>;
export type IPoDocAddFormDto = z.input<typeof PoDocAddRequestSchema>;
export type IPoDocAddUIFormDto = Omit<IPoDocAddFormDto, 'docContext'>;
export type IPoDocAddResponseDto = z.infer<typeof PoDocAddResponseSchema>;

/*
  Invoice Doc Add
*/
export type IInvoiceDocAddRequestDto = z.infer<
  typeof InvoiceDocAddRequestSchema
>;
export type IInvoiceDocAddFormDto = z.input<typeof InvoiceDocAddRequestSchema>;
export type IInvoiceDocAddUIFormDto = Omit<IInvoiceDocAddFormDto, 'docContext'>;
export type IInvoiceDocAddResponseDto = z.infer<
  typeof InvoiceDocAddResponseSchema
>;

/*
  JMC Doc Add
*/
export type IJmcDocAddRequestDto = z.infer<typeof JmcDocAddRequestSchema>;
export type IJmcDocAddFormDto = z.input<typeof JmcDocAddRequestSchema>;
export type IJmcDocAddUIFormDto = Omit<IJmcDocAddFormDto, 'docContext'>;
export type IJmcDocAddResponseDto = z.infer<typeof JmcDocAddResponseSchema>;

/*
  Payment Advice Doc Add
*/
export type IPaymentAdviceDocAddRequestDto = z.infer<
  typeof PaymentAdviceDocAddRequestSchema
>;
export type IPaymentAdviceDocAddFormDto = z.input<
  typeof PaymentAdviceDocAddRequestSchema
>;
export type IPaymentAdviceDocAddUIFormDto = Omit<
  IPaymentAdviceDocAddFormDto,
  'docContext'
>;
export type IPaymentAdviceDocAddResponseDto = z.infer<
  typeof PaymentAdviceDocAddResponseSchema
>;

/*
  Payment Doc Add
*/
export type IPaymentDocAddRequestDto = z.infer<
  typeof PaymentDocAddRequestSchema
>;
export type IPaymentDocAddFormDto = z.input<typeof PaymentDocAddRequestSchema>;
export type IPaymentDocAddUIFormDto = Omit<IPaymentDocAddFormDto, 'docContext'>;
export type IPaymentDocAddResponseDto = z.infer<
  typeof PaymentDocAddResponseSchema
>;

/*
  Report Doc Add
*/
export type IReportDocAddRequestDto = z.infer<typeof ReportDocAddRequestSchema>;
export type IReportDocAddFormDto = z.input<typeof ReportDocAddRequestSchema>;
export type IReportDocAddUIFormDto = Omit<IReportDocAddFormDto, 'docContext'>;
export type IReportDocAddResponseDto = z.infer<
  typeof ReportDocAddResponseSchema
>;

/*
  Doc Delete
*/
export type IDocDeleteResponseDto = z.infer<typeof DocDeleteResponseSchema>;
