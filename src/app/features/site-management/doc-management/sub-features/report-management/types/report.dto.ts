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
