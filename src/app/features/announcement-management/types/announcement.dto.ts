import {
  AnnouncementGetRequestSchema,
  AnnouncementGetStatsResponseSchema,
  AnnouncementGetResponseSchema,
  AnnouncementDetailGetRequestSchema,
  AnnouncementDetailGetResponseSchema,
  AnnouncementUnacknowledgeGetRequestSchema,
  AnnouncementUnacknowledgeGetBaseResponseSchema,
  AnnouncementUnacknowledgeGetStatsResponseSchema,
  AnnouncementUnacknowledgeGetResponseSchema,
  AnnouncementAddResponseSchema,
  AnnouncementAddRequestSchema,
  AnnouncementEditRequestSchema,
  AnnouncementEditResponseSchema,
  AnnouncementDeleteResponseSchema,
  AnnouncementDeleteRequestSchema,
  AnnouncementGetBaseResponseSchema,
  AnnouncementUpsertShapeSchema,
} from '../schemas';
import { z } from 'zod';

/*
  Announcement Get
*/
export type IAnnouncementGetRequestDto = z.infer<
  typeof AnnouncementGetRequestSchema
>;
export type IAnnouncementGetFormDto = z.input<
  typeof AnnouncementGetRequestSchema
>;
export type IAnnouncementGetResponseDto = z.infer<
  typeof AnnouncementGetResponseSchema
>;
export type IAnnouncementGetBaseResponseDto = z.infer<
  typeof AnnouncementGetBaseResponseSchema
>;
export type IAnnouncementGetStatsResponseDto = z.infer<
  typeof AnnouncementGetStatsResponseSchema
>;

/*
  Announcement Detail Get
*/
export type IAnnouncementDetailGetRequestDto = z.infer<
  typeof AnnouncementDetailGetRequestSchema
>;
export type IAnnouncementDetailGetFormDto = z.input<
  typeof AnnouncementDetailGetRequestSchema
>;
export type IAnnouncementDetailGetResponseDto = z.infer<
  typeof AnnouncementDetailGetResponseSchema
>;

/*
  Announcement Unacknowledge Get
*/
export type IAnnouncementUnacknowledgeGetRequestDto = z.infer<
  typeof AnnouncementUnacknowledgeGetRequestSchema
>;
export type IAnnouncementUnacknowledgeGetFormDto = z.input<
  typeof AnnouncementUnacknowledgeGetRequestSchema
>;
export type IAnnouncementUnacknowledgeGetBaseResponseDto = z.infer<
  typeof AnnouncementUnacknowledgeGetBaseResponseSchema
>;
export type IAnnouncementUnacknowledgeGetStatsResponseDto = z.infer<
  typeof AnnouncementUnacknowledgeGetStatsResponseSchema
>;
export type IAnnouncementUnacknowledgeGetResponseDto = z.infer<
  typeof AnnouncementUnacknowledgeGetResponseSchema
>;

/*
  Announcement Add
*/
export type IAnnouncementAddRequestDto = z.infer<
  typeof AnnouncementAddRequestSchema
>;
export type IAnnouncementAddFormDto = z.input<
  typeof AnnouncementAddRequestSchema
>;
export type IAnnouncementAddResponseDto = z.infer<
  typeof AnnouncementAddResponseSchema
>;

/*
  Announcement Edit
*/
export type IAnnouncementEditRequestDto = z.infer<
  typeof AnnouncementEditRequestSchema
>;
export type IAnnouncementEditFormDto = z.input<
  typeof AnnouncementEditRequestSchema
>;
export type IAnnouncementEditResponseDto = z.infer<
  typeof AnnouncementEditResponseSchema
>;

/*
  Announcement Delete
*/
export type IAnnouncementDeleteRequestDto = z.infer<
  typeof AnnouncementDeleteRequestSchema
>;
export type IAnnouncementDeleteFormDto = z.input<
  typeof AnnouncementDeleteRequestSchema
>;
export type IAnnouncementDeleteResponseDto = z.infer<
  typeof AnnouncementDeleteResponseSchema
>;

/*
  Announcement Base
*/
export type IAnnouncementBaseResponseDto = z.infer<
  typeof AnnouncementGetBaseResponseSchema
>;
export type IAnnouncementUpsertShapeDto = z.infer<
  typeof AnnouncementUpsertShapeSchema
>;
