import { z } from 'zod';
import {
  DsrAddRequestSchema,
  DsrAddResponseSchema,
  DsrDeleteResponseSchema,
  DsrDetailGetRequestSchema,
  DsrDetailGetResponseSchema,
  DsrEditRequestSchema,
  DsrEditResponseSchema,
  DsrGetBaseResponseSchema,
  DsrGetRequestSchema,
  DsrGetResponseSchema,
  DsrHistoryGetRequestSchema,
  DsrHistoryGetResponseSchema,
  ProjectAddRequestSchema,
  ProjectAddResponseSchema,
  ProjectChangeStatusRequestSchema,
  ProjectChangeStatusResponseSchema,
  ProjectDeleteRequestSchema,
  ProjectDeleteResponseSchema,
  ProjectDetailGetRequestSchema,
  ProjectDetailGetResponseSchema,
  ProjectEditRequestSchema,
  ProjectEditResponseSchema,
  ProjectGetBaseResponseSchema,
  ProjectGetRequestSchema,
  ProjectGetResponseSchema,
  ProjectGetStatsResponseSchema,
  ProjectTimelineGetResponseSchema,
} from '../schemas';

/*
  Project Add
*/
export type IProjectAddRequestDto = z.infer<typeof ProjectAddRequestSchema>;
export type IProjectAddFormDto = z.input<typeof ProjectAddRequestSchema>;
export type IProjectAddResponseDto = z.infer<typeof ProjectAddResponseSchema>;

/*
  Project Delete
*/
export type IProjectDeleteRequestDto = z.infer<
  typeof ProjectDeleteRequestSchema
>;
export type IProjectDeleteFormDto = z.input<typeof ProjectDeleteRequestSchema>;
export type IProjectDeleteResponseDto = z.infer<
  typeof ProjectDeleteResponseSchema
>;

/*
  Project Edit
*/
export type IProjectEditRequestDto = z.infer<typeof ProjectEditRequestSchema>;
export type IProjectEditFormDto = z.input<typeof ProjectEditRequestSchema>;
export type IProjectEditResponseDto = z.infer<typeof ProjectEditResponseSchema>;

/*
  Project Detail Get
*/
export type IProjectDetailGetRequestDto = z.infer<
  typeof ProjectDetailGetRequestSchema
>;
export type IProjectDetailGetFormDto = z.input<
  typeof ProjectDetailGetRequestSchema
>;
export type IProjectDetailGetResponseDto = z.infer<
  typeof ProjectDetailGetResponseSchema
>;

/*
  Project Get
*/
export type IProjectGetRequestDto = z.infer<typeof ProjectGetRequestSchema>;
export type IProjectGetFormDto = z.input<typeof ProjectGetRequestSchema>;
export type IProjectGetResponseDto = z.infer<typeof ProjectGetResponseSchema>;
export type IProjectGetBaseResponseDto = z.infer<
  typeof ProjectGetBaseResponseSchema
>;
export type IProjectGetStatsResponseDto = z.infer<
  typeof ProjectGetStatsResponseSchema
>;

/*
  Project Timeline
*/
export type IProjectTimelineGetResponseDto = z.infer<
  typeof ProjectTimelineGetResponseSchema
>;

/*
  Project Change Status
*/
export type IProjectChangeStatusRequestDto = z.infer<
  typeof ProjectChangeStatusRequestSchema
>;
export type IProjectChangeStatusFormDto = z.input<
  typeof ProjectChangeStatusRequestSchema
>;
export type IProjectChangeStatusResponseDto = z.infer<
  typeof ProjectChangeStatusResponseSchema
>;

/*
  Dsr Get
*/
export type IDsrGetRequestDto = z.infer<typeof DsrGetRequestSchema>;
export type IDsrGetFormDto = z.input<typeof DsrGetRequestSchema>;
export type IDsrGetResponseDto = z.infer<typeof DsrGetResponseSchema>;
export type IDsrGetBaseResponseDto = z.infer<typeof DsrGetBaseResponseSchema>;

/*
  Dsr Detail Get
*/
export type IDsrDetailGetRequestDto = z.infer<typeof DsrDetailGetRequestSchema>;
export type IDsrDetailGetFormDto = z.input<typeof DsrDetailGetRequestSchema>;
export type IDsrDetailGetResponseDto = z.infer<
  typeof DsrDetailGetResponseSchema
>;

/*
  Dsr Add
*/
export type IDsrAddRequestDto = z.infer<typeof DsrAddRequestSchema>;
export type IDsrAddFormDto = z.input<typeof DsrAddRequestSchema>;
export type IDsrAddUIFormDto = Omit<IDsrAddFormDto, 'projectName'>;
export type IDsrAddResponseDto = z.infer<typeof DsrAddResponseSchema>;

/*
  Dsr Edit
*/
export type IDsrEditRequestDto = z.infer<typeof DsrEditRequestSchema>;
export type IDsrEditFormDto = z.input<typeof DsrEditRequestSchema>;
export type IDsrEditUIFormDto = IDsrEditFormDto & {
  statusDate: Date;
};
export type IDsrEditResponseDto = z.infer<typeof DsrEditResponseSchema>;

/*
  Dsr Delete
*/
export type IDsrDeleteResponseDto = z.infer<typeof DsrDeleteResponseSchema>;

/*
  Dsr History Get
*/
export type IDsrHistoryGetRequestDto = z.infer<
  typeof DsrHistoryGetRequestSchema
>;
export type IDsrHistoryGetFormDto = z.input<typeof DsrHistoryGetRequestSchema>;
export type IDsrHistoryGetResponseDto = z.infer<
  typeof DsrHistoryGetResponseSchema
>;
