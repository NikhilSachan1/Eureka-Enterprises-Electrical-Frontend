import { z } from 'zod';
import {
  AddPaymentSheetItemsRequestSchema,
  AddPaymentSheetItemsResponseSchema,
} from '../schemas/add-payment-sheet-items.schema';
import {
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
} from '../schemas/create-payment-sheet.schema';
import {
  DeletePaymentSheetItemRequestSchema,
  DeletePaymentSheetItemResponseSchema,
} from '../schemas/delete-payment-sheet-item.schema';
import { DownloadPaymentSheetPdfFormSchema } from '../schemas/download-payment-sheet-pdf.schema';
import {
  PaymentSheetDetailGetRequestSchema,
  PaymentSheetDetailGetResponseSchema,
  PaymentSheetItemDetailSchema,
} from '../schemas/get-payment-sheet-detail.schema';
import {
  PaymentSheetGetBaseResponseSchema,
  PaymentSheetGetRequestSchema,
  PaymentSheetGetResponseSchema,
  PaymentSheetGetStatsSchema,
} from '../schemas/get-payment-sheet.schema';
import {
  UpdatePaymentSheetItemRequestSchema,
  UpdatePaymentSheetItemResponseSchema,
} from '../schemas/update-payment-sheet-item.schema';
import { ForwardPaymentSheetResponseSchema } from '../schemas/forward-payment-sheet.schema';
import {
  PayPaymentSheetItemRequestSchema,
  PayPaymentSheetItemResponseSchema,
} from '../schemas/pay-payment-sheet-item.schema';
import {
  RejectPaymentSheetItemRequestSchema,
  RejectPaymentSheetItemResponseSchema,
} from '../schemas/reject-payment-sheet-item.schema';
import {
  RejectPaymentSheetRequestSchema,
  RejectPaymentSheetResponseSchema,
} from '../schemas/reject-payment-sheet.schema';
import {
  ReturnPaymentSheetRequestSchema,
  ReturnPaymentSheetResponseSchema,
} from '../schemas/return-payment-sheet.schema';
import { SubmitPaymentSheetResponseSchema } from '../schemas/submit-payment-sheet.schema';
import {
  VerifyPaymentSheetItemsRequestSchema,
  VerifyPaymentSheetItemsResponseSchema,
} from '../schemas/verify-payment-sheet-items.schema';
import {
  UnverifyPaymentSheetItemsRequestSchema,
  UnverifyPaymentSheetItemsResponseSchema,
} from '../schemas/unverify-payment-sheet-items.schema';

export type ICreatePaymentSheetFormDto = z.input<
  typeof CreatePaymentSheetRequestSchema
>;
export type ICreatePaymentSheetResponseDto = z.infer<
  typeof CreatePaymentSheetResponseSchema
>;

export type IAddPaymentSheetItemsFormDto = z.input<
  typeof AddPaymentSheetItemsRequestSchema
>;
export type IAddPaymentSheetItemsResponseDto = z.infer<
  typeof AddPaymentSheetItemsResponseSchema
>;

export type ICreatePaymentSheetUIFormDto = Required<
  Pick<ICreatePaymentSheetFormDto, 'title'>
>;

export type IPaymentSheetGetBaseResponseDto = z.infer<
  typeof PaymentSheetGetBaseResponseSchema
>;
export type IPaymentSheetGetFormDto = z.input<
  typeof PaymentSheetGetRequestSchema
>;
export type IPaymentSheetGetStatsResponseDto = z.infer<
  typeof PaymentSheetGetStatsSchema
>;
export type IPaymentSheetGetResponseDto = z.infer<
  typeof PaymentSheetGetResponseSchema
>;

export type IPaymentSheetDetailGetFormDto = z.input<
  typeof PaymentSheetDetailGetRequestSchema
>;
export type IPaymentSheetDetailGetResponseDto = z.infer<
  typeof PaymentSheetDetailGetResponseSchema
>;
export type IPaymentSheetItemDetailDto = z.infer<
  typeof PaymentSheetItemDetailSchema
>;

export type IDeletePaymentSheetItemFormDto = z.input<
  typeof DeletePaymentSheetItemRequestSchema
>;
export type IDeletePaymentSheetItemResponseDto = z.infer<
  typeof DeletePaymentSheetItemResponseSchema
>;

export type IUpdatePaymentSheetItemFormDto = z.input<
  typeof UpdatePaymentSheetItemRequestSchema
>;
export type IUpdatePaymentSheetItemResponseDto = z.infer<
  typeof UpdatePaymentSheetItemResponseSchema
>;

export type IForwardPaymentSheetResponseDto = z.infer<
  typeof ForwardPaymentSheetResponseSchema
>;

export type ISubmitPaymentSheetResponseDto = z.infer<
  typeof SubmitPaymentSheetResponseSchema
>;

export type IReturnPaymentSheetFormDto = z.input<
  typeof ReturnPaymentSheetRequestSchema
>;
export type IReturnPaymentSheetResponseDto = z.infer<
  typeof ReturnPaymentSheetResponseSchema
>;

export type IRejectPaymentSheetFormDto = z.input<
  typeof RejectPaymentSheetRequestSchema
>;
export type IRejectPaymentSheetResponseDto = z.infer<
  typeof RejectPaymentSheetResponseSchema
>;

export type IRejectPaymentSheetItemFormDto = z.input<
  typeof RejectPaymentSheetItemRequestSchema
>;
export type IRejectPaymentSheetItemResponseDto = z.infer<
  typeof RejectPaymentSheetItemResponseSchema
>;

export type IPayPaymentSheetItemFormDto = z.input<
  typeof PayPaymentSheetItemRequestSchema
>;
export type IPayPaymentSheetItemResponseDto = z.infer<
  typeof PayPaymentSheetItemResponseSchema
>;

export type IVerifyPaymentSheetItemsFormDto = z.input<
  typeof VerifyPaymentSheetItemsRequestSchema
>;
export type IVerifyPaymentSheetItemsResponseDto = z.infer<
  typeof VerifyPaymentSheetItemsResponseSchema
>;

export type IUnverifyPaymentSheetItemsFormDto = z.input<
  typeof UnverifyPaymentSheetItemsRequestSchema
>;
export type IUnverifyPaymentSheetItemsResponseDto = z.infer<
  typeof UnverifyPaymentSheetItemsResponseSchema
>;
export type IDownloadPaymentSheetPdfFormDto = z.input<
  typeof DownloadPaymentSheetPdfFormSchema
>;
export interface IPaymentSheetPdfFormDto {
  sourceType: string;
}
