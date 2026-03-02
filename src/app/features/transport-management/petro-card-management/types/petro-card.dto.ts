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
  PetroCardLinkResponseSchema,
  PetroCardLinkRequestSchema,
} from '../schemas';
import { z } from 'zod';

/*
 * Add Petro Card
 */
export type IPetroCardAddRequestDto = z.infer<typeof PetroCardAddRequestSchema>;
export type IPetroCardAddFormDto = z.input<typeof PetroCardAddRequestSchema>;
export type IPetroCardAddResponseDto = z.infer<
  typeof PetroCardAddResponseSchema
>;

/*
 * Delete Petro Card
 */
export type IPetroCardDeleteRequestDto = z.infer<
  typeof PetroCardDeleteRequestSchema
>;
export type IPetroCardDeleteFormDto = z.input<
  typeof PetroCardDeleteRequestSchema
>;
export type IPetroCardDeleteResponseDto = z.infer<
  typeof PetroCardDeleteResponseSchema
>;

/*
 * Edit Petro Card
 */
export type IPetroCardEditRequestDto = z.infer<
  typeof PetroCardEditRequestSchema
>;
export type IPetroCardEditFormDto = z.input<typeof PetroCardEditRequestSchema>;
export type IPetroCardEditResponseDto = z.infer<
  typeof PetroCardEditResponseSchema
>;

/*
 * Get Petro Card
 */
export type IPetroCardGetRequestDto = z.infer<typeof PetroCardGetRequestSchema>;
export type IPetroCardGetFormDto = z.input<typeof PetroCardGetRequestSchema>;
export type IPetroCardGetResponseDto = z.infer<
  typeof PetroCardGetResponseSchema
>;
export type IPetroCardGetBaseResponseDto = z.infer<
  typeof PetroCardGetBaseResponseSchema
>;
export type IPetroCardGetStatsResponseDto = z.infer<
  typeof PetroCardGetStatsResponseSchema
>;

/*
 * Link Petro Card
 */
export type IPetroCardLinkRequestDto = z.infer<
  typeof PetroCardLinkRequestSchema
>;
export type IPetroCardLinkFormDto = z.input<typeof PetroCardLinkRequestSchema>;
export type IPetroCardLinkUIFormDto = Omit<IPetroCardLinkFormDto, 'action'>;
export type IPetroCardLinkResponseDto = z.infer<
  typeof PetroCardLinkResponseSchema
>;
