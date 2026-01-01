import {
  PetroCardAddRequestSchema,
  PetroCardDeleteRequestSchema,
  PetroCardDeleteResponseSchema,
  PetroCardEditRequestSchema,
  PetroCardEditResponseSchema,
  PetroCardGetRequestSchema,
  PetroCardGetResponseSchema,
  PetroCardGetBaseResponseSchema,
  PetroCardGetStatsResponseSchema,
  PetroCardAddResponseSchema,
} from '../schemas';
import { z } from 'zod';

export type IPetroCardAddRequestDto = z.infer<typeof PetroCardAddRequestSchema>;
export type IPetroCardAddResponseDto = z.infer<
  typeof PetroCardAddResponseSchema
>;
export type IPetroCardDeleteRequestDto = z.infer<
  typeof PetroCardDeleteRequestSchema
>;
export type IPetroCardDeleteResponseDto = z.infer<
  typeof PetroCardDeleteResponseSchema
>;
export type IPetroCardEditRequestDto = z.infer<
  typeof PetroCardEditRequestSchema
>;
export type IPetroCardEditResponseDto = z.infer<
  typeof PetroCardEditResponseSchema
>;
export type IPetroCardGetRequestDto = z.infer<typeof PetroCardGetRequestSchema>;
export type IPetroCardGetResponseDto = z.infer<
  typeof PetroCardGetResponseSchema
>;
export type IPetroCardGetBaseResponseDto = z.infer<
  typeof PetroCardGetBaseResponseSchema
>;
export type IPetroCardGetStatsResponseDto = z.infer<
  typeof PetroCardGetStatsResponseSchema
>;
