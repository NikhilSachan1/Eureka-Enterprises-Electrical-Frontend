import { z } from 'zod';
import {
  VehicleReadingAddRequestSchema,
  VehicleReadingAddResponseSchema,
  VehicleReadingDetailGetRequestSchema,
  VehicleReadingDetailGetResponseSchema,
  VehicleReadingEditRequestSchema,
  VehicleReadingEditResponseSchema,
  VehicleReadingGetBaseResponseSchema,
  VehicleReadingGetRequestSchema,
  VehicleReadingGetResponseSchema,
} from '../schemas';

/**
 * Vehicle Reading Add
 */
export type IVehicleReadingAddRequestDto = z.infer<
  typeof VehicleReadingAddRequestSchema
>;
export type IvehicleReadingAddFormDto = z.input<
  typeof VehicleReadingAddRequestSchema
>;

export type IVehicleReadingAddUIFormDto = Omit<
  IvehicleReadingAddFormDto,
  'vehicleName'
> & {
  employeeName: string;
};

export type IVehicleReadingAddResponseDto = z.infer<
  typeof VehicleReadingAddResponseSchema
>;

/**
 * Vehicle Reading Edit
 */
export type IVehicleReadingEditRequestDto = z.infer<
  typeof VehicleReadingEditRequestSchema
>;
export type IvehicleReadingEditFormDto = z.input<
  typeof VehicleReadingEditRequestSchema
>;
export type IVehicleReadingEditUIFormDto = Omit<
  IvehicleReadingEditFormDto,
  'vehicleName'
> & {
  employeeName: string;
};
export type IVehicleReadingEditResponseDto = z.infer<
  typeof VehicleReadingEditResponseSchema
>;

/**
 * Vehicle Reading Detail Get
 */
export type IVehicleReadingDetailGetRequestDto = z.infer<
  typeof VehicleReadingDetailGetRequestSchema
>;
export type IvehicleReadingDetailGetFormDto = z.input<
  typeof VehicleReadingDetailGetRequestSchema
>;
export type IVehicleReadingDetailGetResponseDto = z.infer<
  typeof VehicleReadingDetailGetResponseSchema
>;

/**
 * Vehicle Reading Get
 */
export type IVehicleReadingGetRequestDto = z.infer<
  typeof VehicleReadingGetRequestSchema
>;
export type IvehicleReadingGetFormDto = z.input<
  typeof VehicleReadingGetRequestSchema
>;
export type IVehicleReadingGetBaseResponseDto = z.infer<
  typeof VehicleReadingGetBaseResponseSchema
>;
export type IVehicleReadingGetResponseDto = z.infer<
  typeof VehicleReadingGetResponseSchema
>;
