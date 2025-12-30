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

export type IAssetAddRequestDto = z.infer<typeof AssetAddRequestSchema>;
export type IAssetAddResponseDto = z.infer<typeof AssetAddResponseSchema>;
export type IAssetDeleteRequestDto = z.infer<typeof AssetDeleteRequestSchema>;
export type IAssetDeleteResponseDto = z.infer<typeof AssetDeleteResponseSchema>;
export type IAssetEditRequestDto = z.infer<typeof AssetEditRequestSchema>;
export type IAssetEditResponseDto = z.infer<typeof AssetEditResponseSchema>;
export type IAssetDetailGetRequestDto = z.infer<
  typeof AssetDetailGetRequestSchema
>;
export type IAssetDetailGetResponseDto = z.infer<
  typeof AssetDetailGetResponseSchema
>;
export type IAssetGetRequestDto = z.infer<typeof AssetGetRequestSchema>;
export type IAssetGetBaseResponseDto = z.infer<
  typeof AssetGetBaseResponseSchema
>;
export type IAssetGetResponseDto = z.infer<typeof AssetGetResponseSchema>;
export type IAssetGetStatsResponseDto = z.infer<
  typeof AssetGetStatsResponseSchema
>;
