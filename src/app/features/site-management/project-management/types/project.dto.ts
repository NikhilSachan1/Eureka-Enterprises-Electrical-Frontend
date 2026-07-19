import { z } from 'zod';
import {
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
  ProjectOverviewGetResponseSchema,
  SiteAllocationGetRequestSchema,
  SiteAllocationGetBaseResponseSchema,
  SiteAllocationGetResponseSchema,
  WorkforceAllocationGetRequestSchema,
  WorkforceAllocationGetBaseResponseSchema,
  WorkforceAllocationGetStatsSchema,
  WorkforceAllocationGetResponseSchema,
  WorkforceAllocationActionRequestSchema,
  WorkforceAllocationManageResponseSchema,
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
  Project Overview Get
*/
export type IProjectOverviewGetResponseDto = z.infer<
  typeof ProjectOverviewGetResponseSchema
>;

/*
  Site allocation history
*/
export type ISiteAllocationGetRequestDto = z.infer<
  typeof SiteAllocationGetRequestSchema
>;
export type ISiteAllocationGetFormDto = z.input<
  typeof SiteAllocationGetRequestSchema
>;
export type ISiteAllocationGetResponseDto = z.infer<
  typeof SiteAllocationGetResponseSchema
>;
export type ISiteAllocationGetBaseResponseDto = z.infer<
  typeof SiteAllocationGetBaseResponseSchema
>;

/*
  Workforce allocation (site-allocations/employees)
*/
export type IWorkforceAllocationGetRequestDto = z.infer<
  typeof WorkforceAllocationGetRequestSchema
>;
export type IWorkforceAllocationGetFormDto = z.input<
  typeof WorkforceAllocationGetRequestSchema
>;
export type IWorkforceAllocationGetStatsDto = z.infer<
  typeof WorkforceAllocationGetStatsSchema
>;
export type IWorkforceAllocationGetBaseResponseDto = z.infer<
  typeof WorkforceAllocationGetBaseResponseSchema
>;
export type IWorkforceAllocationGetResponseDto = z.infer<
  typeof WorkforceAllocationGetResponseSchema
>;

/*
  Workforce allocation action (allocate / deallocate / transfer)
*/
export type IWorkforceAllocationManageRequestDto = z.infer<
  typeof WorkforceAllocationActionRequestSchema
>;
export type IWorkforceAllocationManageFormDto = z.input<
  typeof WorkforceAllocationActionRequestSchema
>;
export type IWorkforceAllocationManageResponseDto = z.infer<
  typeof WorkforceAllocationManageResponseSchema
>;
