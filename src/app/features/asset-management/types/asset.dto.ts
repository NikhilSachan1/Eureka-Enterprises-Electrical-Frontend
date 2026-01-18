import { z } from 'zod';
import {
  AssetAddRequestSchema,
  AssetAddResponseSchema,
} from '../schemas/add-asset.schema';
import {
  AssetDeleteRequestSchema,
  AssetDeleteResponseSchema,
} from '../schemas/delete-asset.schema';
import {
  AssetEditRequestSchema,
  AssetEditResponseSchema,
} from '../schemas/edit-asset.schema';
import {
  AssetDetailGetRequestSchema,
  AssetDetailGetResponseSchema,
} from '../schemas/get-asset-detail.schema';
import {
  AssetGetBaseResponseSchema,
  AssetGetRequestSchema,
  AssetGetResponseSchema,
  AssetGetStatsResponseSchema,
} from '../schemas/get-asset.schema';
import {
  ActionAssetRequestSchema,
  ActionAssetResponseSchema,
  AssetEventHistoryGetBaseResponseSchema,
  AssetEventHistoryGetRequestSchema,
  AssetEventHistoryGetResponseSchema,
  AssetEventHistoryGetStatsResponseSchema,
} from '../schemas';

/*
  Asset Add
*/
export type IAssetAddRequestDto = z.infer<typeof AssetAddRequestSchema>;
export type IAssetAddFormDto = z.input<typeof AssetAddRequestSchema>;
export type IAssetAddResponseDto = z.infer<typeof AssetAddResponseSchema>;

/*
  Asset Delete
*/
export type IAssetDeleteRequestDto = z.infer<typeof AssetDeleteRequestSchema>;
export type IAssetDeleteFormDto = z.input<typeof AssetDeleteRequestSchema>;
export type IAssetDeleteResponseDto = z.infer<typeof AssetDeleteResponseSchema>;

/*
  Asset Edit
*/
export type IAssetEditRequestDto = z.infer<typeof AssetEditRequestSchema>;
export type IAssetEditFormDto = z.input<typeof AssetEditRequestSchema>;
export type IAssetEditResponseDto = z.infer<typeof AssetEditResponseSchema>;

/*
  Asset Detail Get
*/
export type IAssetDetailGetRequestDto = z.infer<
  typeof AssetDetailGetRequestSchema
>;
export type IAssetDetailGetFormDto = z.input<
  typeof AssetDetailGetRequestSchema
>;
export type IAssetDetailGetResponseDto = z.infer<
  typeof AssetDetailGetResponseSchema
>;

/*
  Asset Get
*/
export type IAssetGetRequestDto = z.infer<typeof AssetGetRequestSchema>;
export type IAssetGetFormDto = z.input<typeof AssetGetRequestSchema>;
export type IAssetGetBaseResponseDto = z.infer<
  typeof AssetGetBaseResponseSchema
>;
export type IAssetGetResponseDto = z.infer<typeof AssetGetResponseSchema>;
export type IAssetGetStatsResponseDto = z.infer<
  typeof AssetGetStatsResponseSchema
>;

/*
  Action Asset
*/
export type IActionAssetRequestDto = z.infer<typeof ActionAssetRequestSchema>;
export type IActionAssetFormDto = z.input<typeof ActionAssetRequestSchema>;
export type IActionAssetUIFormDto = Omit<
  IActionAssetFormDto,
  'assetId' | 'actionType'
>;
export type IActionAssetResponseDto = z.infer<typeof ActionAssetResponseSchema>;

/*
  Asset Event History Get
*/
export type IAssetEventHistoryGetRequestDto = z.infer<
  typeof AssetEventHistoryGetRequestSchema
>;
export type IAssetEventHistoryGetFormDto = z.input<
  typeof AssetEventHistoryGetRequestSchema
>;
export type IAssetEventHistoryGetBaseResponseDto = z.infer<
  typeof AssetEventHistoryGetBaseResponseSchema
>;
export type IAssetEventHistoryGetResponseDto = z.infer<
  typeof AssetEventHistoryGetResponseSchema
>;
export type IAssetEventHistoryGetStatsResponseDto = z.infer<
  typeof AssetEventHistoryGetStatsResponseSchema
>;
