import { z } from 'zod';
import {
  AddReportRequestSchema,
  AddReportResponseSchema,
  DeleteReportResponseSchema,
  EditReportRequestSchema,
  EditReportResponseSchema,
  ReportDetailGetResponseSchema,
  ReportGetBaseResponseSchema,
  ReportGetRequestSchema,
  ReportGetResponseSchema,
  ApproveReportRequestSchema,
  ApproveReportResponseSchema,
  RejectReportRequestSchema,
  RejectReportResponseSchema,
  UnlockRequestReportRequestSchema,
  UnlockRequestReportResponseSchema,
  UnlockGrantReportResponseSchema,
  UnlockRejectReportResponseSchema,
} from '../schemas';
import { ReportDetailGetRequestSchema } from '../schemas/get-report-detail.schema';

/** Report list */
export type IReportGetBaseResponseDto = z.infer<
  typeof ReportGetBaseResponseSchema
>;
export type IReportGetResponseDto = z.infer<typeof ReportGetResponseSchema>;
export type IReportGetRequestDto = z.infer<typeof ReportGetRequestSchema>;
export type IReportGetFormDto = z.input<typeof ReportGetRequestSchema>;

/** Report detail */
export type IReportDetailGetResponseDto = z.infer<
  typeof ReportDetailGetResponseSchema
>;
export type IReportDetailGetRequestDto = z.infer<
  typeof ReportDetailGetRequestSchema
>;

/** Delete */
export type IDeleteReportResponseDto = z.infer<
  typeof DeleteReportResponseSchema
>;

/** Add */
export type IAddReportFormDto = z.input<typeof AddReportRequestSchema>;
export type IAddReportUIFormDto = Omit<
  IAddReportFormDto,
  'reportFileKey' | 'reportFileName'
> & {
  reportAttachment: File[];
  projectName: string;
};
export type IAddReportResponseDto = z.infer<typeof AddReportResponseSchema>;

/** Edit */
export type IEditReportFormDto = z.input<typeof EditReportRequestSchema>;
export type IEditReportUIFormDto = Omit<
  IEditReportFormDto,
  'reportFileKey' | 'reportFileName'
> & {
  reportAttachment: File[];
  projectName: string;
  jmcNumber: string;
};
export type IEditReportResponseDto = z.infer<typeof EditReportResponseSchema>;

/** Approve */
export type IApproveReportFormDto = z.input<typeof ApproveReportRequestSchema>;
export type IApproveReportResponseDto = z.infer<
  typeof ApproveReportResponseSchema
>;

/** Reject */
export type IRejectReportFormDto = z.input<typeof RejectReportRequestSchema>;
export type IRejectReportResponseDto = z.infer<
  typeof RejectReportResponseSchema
>;

/** Unlock request */
export type IUnlockRequestReportFormDto = z.input<
  typeof UnlockRequestReportRequestSchema
>;
export type IUnlockRequestReportResponseDto = z.infer<
  typeof UnlockRequestReportResponseSchema
>;

/** Unlock grant */
export type IUnlockGrantReportResponseDto = z.infer<
  typeof UnlockGrantReportResponseSchema
>;

/** Unlock request reject */
export type IUnlockRejectReportResponseDto = z.infer<
  typeof UnlockRejectReportResponseSchema
>;
