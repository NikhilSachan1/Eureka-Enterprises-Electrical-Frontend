import {
  VehicleServiceAddRequestSchema,
  VehicleServiceEditRequestSchema,
  VehicleServiceEditResponseSchema,
  VehicleServiceAddResponseSchema,
  VehicleServiceDeleteResponseSchema,
  VehicleServiceDeleteRequestSchema,
  VehicleServiceGetRequestSchema,
  VehicleServiceDetailGetRequestSchema,
  VehicleServiceDetailGetResponseSchema,
} from '../schemas';
import { z } from 'zod';
import {
  VehicleServiceGetBaseResponseSchema,
  VehicleServiceGetResponseSchema,
  VehicleServiceGetStatsResponseSchema,
} from '../../vehicle-service-management/schemas/get-vehicle-service.schema';

/**
 * Vehicle Service Add
 */
export type IVehicleServiceAddRequestDto = z.infer<
  typeof VehicleServiceAddRequestSchema
>;
export type IvehicleServiceAddFormDto = z.input<
  typeof VehicleServiceAddRequestSchema
>;
export type IVehicleServiceAddResponseDto = z.infer<
  typeof VehicleServiceAddResponseSchema
>;

/**
 * Vehicle Service Edit
 */
export type IVehicleServiceEditRequestDto = z.infer<
  typeof VehicleServiceEditRequestSchema
>;
export type IvehicleServiceEditFormDto = z.input<
  typeof VehicleServiceEditRequestSchema
>;
export type IVehicleServiceEditResponseDto = z.infer<
  typeof VehicleServiceEditResponseSchema
>;

/**
 * Vehicle Service Delete
 */
export type IVehicleServiceDeleteRequestDto = z.infer<
  typeof VehicleServiceDeleteRequestSchema
>;
export type IvehicleServiceDeleteFormDto = z.input<
  typeof VehicleServiceDeleteRequestSchema
>;
export type IVehicleServiceDeleteResponseDto = z.infer<
  typeof VehicleServiceDeleteResponseSchema
>;

/**
 * Vehicle Service Get
 */
export type IVehicleServiceGetRequestDto = z.infer<
  typeof VehicleServiceGetRequestSchema
>;
export type IVehicleServiceGetFormDto = z.input<
  typeof VehicleServiceGetRequestSchema
>;
export type IVehicleServiceGetUIFormDto = Omit<
  IVehicleServiceGetFormDto,
  'vehicleId'
>;
export type IVehicleServiceGetResponseDto = z.infer<
  typeof VehicleServiceGetResponseSchema
>;
export type IVehicleServiceGetStatsResponseDto = z.infer<
  typeof VehicleServiceGetStatsResponseSchema
>;
export type IVehicleServiceGetBaseResponseDto = z.infer<
  typeof VehicleServiceGetBaseResponseSchema
>;

/**
 * Vehicle Service Detail
 */
export type IVehicleServiceDetailGetRequestDto = z.infer<
  typeof VehicleServiceDetailGetRequestSchema
>;
export type IVehicleServiceDetailGetFormDto = z.input<
  typeof VehicleServiceDetailGetRequestSchema
>;
export type IVehicleServiceDetailGetResponseDto = z.infer<
  typeof VehicleServiceDetailGetResponseSchema
>;
