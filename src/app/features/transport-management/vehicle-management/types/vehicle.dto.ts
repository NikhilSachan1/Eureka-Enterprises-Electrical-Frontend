import { z } from 'zod';
import {
  VehicleAddRequestSchema,
  VehicleAddResponseSchema,
} from '../schemas/add-vehicle.schema';
import {
  VehicleDeleteRequestSchema,
  VehicleDeleteResponseSchema,
} from '../schemas/delete-vehicle.schema';
import {
  VehicleEditRequestSchema,
  VehicleEditResponseSchema,
} from '../schemas/edit-vehicle.schema';
import {
  VehicleDetailGetRequestSchema,
  VehicleDetailGetResponseSchema,
} from '../schemas/get-vehicle-detail.schema';
import {
  VehicleGetBaseResponseSchema,
  VehicleGetRequestSchema,
  VehicleGetResponseSchema,
  VehicleGetStatsResponseSchema,
} from '../schemas/get-vehicle.schema';
import {
  ActionVehicleRequestSchema,
  ActionVehicleResponseSchema,
  VehicleEventHistoryGetBaseResponseSchema,
  VehicleEventHistoryGetRequestSchema,
  VehicleEventHistoryGetResponseSchema,
  VehicleEventHistoryGetStatsResponseSchema,
} from '../schemas';

/**
 * Vehicle Add
 */
export type IVehicleAddRequestDto = z.infer<typeof VehicleAddRequestSchema>;
export type IvehicleAddFormDto = z.input<typeof VehicleAddRequestSchema>;
export type IVehicleAddResponseDto = z.infer<typeof VehicleAddResponseSchema>;

/**
 * Vehicle Delete
 */
export type IVehicleDeleteRequestDto = z.infer<
  typeof VehicleDeleteRequestSchema
>;
export type IvehicleDeleteFormDto = z.input<typeof VehicleDeleteRequestSchema>;
export type IVehicleDeleteResponseDto = z.infer<
  typeof VehicleDeleteResponseSchema
>;

/**
 * Vehicle Edit
 */
export type IVehicleEditRequestDto = z.infer<typeof VehicleEditRequestSchema>;
export type IvehicleEditFormDto = z.input<typeof VehicleEditRequestSchema>;
export type IVehicleEditResponseDto = z.infer<typeof VehicleEditResponseSchema>;

/**
 * Vehicle Detail Get
 */
export type IVehicleDetailGetRequestDto = z.infer<
  typeof VehicleDetailGetRequestSchema
>;
export type IvehicleDetailGetFormDto = z.input<
  typeof VehicleDetailGetRequestSchema
>;
export type IVehicleDetailGetResponseDto = z.infer<
  typeof VehicleDetailGetResponseSchema
>;

/**
 * Vehicle Get
 */
export type IVehicleGetRequestDto = z.infer<typeof VehicleGetRequestSchema>;
export type IvehicleGetFormDto = z.input<typeof VehicleGetRequestSchema>;
export type IVehicleGetBaseResponseDto = z.infer<
  typeof VehicleGetBaseResponseSchema
>;
export type IVehicleGetResponseDto = z.infer<typeof VehicleGetResponseSchema>;
export type IVehicleGetStatsResponseDto = z.infer<
  typeof VehicleGetStatsResponseSchema
>;

/**
 * Vehicle Action
 */
export type IVehicleActionRequestDto = z.infer<
  typeof ActionVehicleRequestSchema
>;
export type IvehicleActionFormDto = z.input<typeof ActionVehicleRequestSchema>;
export type IvehicleActionUIFormDto = Omit<
  IvehicleActionFormDto,
  'vehicleId' | 'actionType'
>;
export type IVehicleActionResponseDto = z.infer<
  typeof ActionVehicleResponseSchema
>;

/**
 * Vehicle Event History Get
 */
export type IVehicleEventHistoryGetRequestDto = z.infer<
  typeof VehicleEventHistoryGetRequestSchema
>;
export type IVehicleEventHistoryGetFormDto = z.input<
  typeof VehicleEventHistoryGetRequestSchema
>;
export type IVehicleEventHistoryGetBaseResponseDto = z.infer<
  typeof VehicleEventHistoryGetBaseResponseSchema
>;
export type IVehicleEventHistoryGetResponseDto = z.infer<
  typeof VehicleEventHistoryGetResponseSchema
>;
export type IVehicleEventHistoryGetStatsResponseDto = z.infer<
  typeof VehicleEventHistoryGetStatsResponseSchema
>;
