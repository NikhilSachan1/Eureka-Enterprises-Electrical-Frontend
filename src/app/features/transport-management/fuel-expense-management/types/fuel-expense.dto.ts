import { z } from 'zod';
import {
  FuelExpenseGetRequestSchema,
  FuelExpenseGetResponseSchema,
  FuelExpenseAddRequestSchema,
  FuelExpenseAddResponseSchema,
  FuelExpenseActionRequestSchema,
  FuelExpenseDeleteRequestSchema,
  FuelExpenseDeleteResponseSchema,
  FuelExpenseDetailGetResponseSchema,
  FuelExpenseDetailGetRequestSchema,
  FuelExpenseEditResponseSchema,
  FuelExpenseEditRequestSchema,
  FuelExpenseForceResponseSchema,
  FuelExpenseForceRequestSchema,
  FuelExpenseReimburseResponseSchema,
  FuelExpenseReimburseRequestSchema,
  FuelExpenseActionResponseSchema,
  FuelExpenseGetBaseResponseSchema,
  FuelExpenseGetStatsResponseSchema,
  LinkedUserVehicleDetailGetRequestSchema,
  LinkedUserVehicleDetailGetResponseSchema,
  LinkedUserVehicleDetailSchema,
  LinkedVehiclePetroCardSchema,
} from '../schemas';

/*
  Expense Get
*/

export type IFuelExpenseGetBaseResponseDto = z.infer<
  typeof FuelExpenseGetBaseResponseSchema
>;
export type IFuelExpenseGetResponseDto = z.infer<
  typeof FuelExpenseGetResponseSchema
>;
export type IFuelExpenseGetStatsResponseDto = z.infer<
  typeof FuelExpenseGetStatsResponseSchema
>;
export type IFuelExpenseGetRequestDto = z.infer<
  typeof FuelExpenseGetRequestSchema
>;
export type IFuelExpenseGetFormDto = z.input<
  typeof FuelExpenseGetRequestSchema
>;

/*
  Expense Detail Get
*/

export type IFuelExpenseDetailGetRequestDto = z.infer<
  typeof FuelExpenseDetailGetRequestSchema
>;
export type IFuelExpenseDetailGetFormDto = z.input<
  typeof FuelExpenseDetailGetRequestSchema
>;
export type IFuelExpenseDetailGetResponseDto = z.infer<
  typeof FuelExpenseDetailGetResponseSchema
>;

/*
  Expense Action
*/

export type IFuelExpenseActionRequestDto = z.infer<
  typeof FuelExpenseActionRequestSchema
>;
export type IFuelExpenseActionFormDto = z.input<
  typeof FuelExpenseActionRequestSchema
>;
export type IFuelExpenseActionUIFormDto = Pick<
  IFuelExpenseActionFormDto,
  'remark'
>;
export type IFuelExpenseActionResponseDto = z.infer<
  typeof FuelExpenseActionResponseSchema
>;

/*
  Expense Delete
*/

export type IFuelExpenseDeleteRequestDto = z.infer<
  typeof FuelExpenseDeleteRequestSchema
>;
export type IFuelExpenseDeleteFormDto = z.input<
  typeof FuelExpenseDeleteRequestSchema
>;
export type IFuelExpenseDeleteResponseDto = z.infer<
  typeof FuelExpenseDeleteResponseSchema
>;

/*
  Expense Add
*/

export type IFuelExpenseAddRequestDto = z.infer<
  typeof FuelExpenseAddRequestSchema
>;
export type IFuelExpenseAddFormDto = z.input<
  typeof FuelExpenseAddRequestSchema
>;
export type IFuelExpenseAddUIFormDto = Omit<
  IFuelExpenseAddFormDto,
  'vehicleName' | 'cardName'
>;
export type IFuelExpenseAddResponseDto = z.infer<
  typeof FuelExpenseAddResponseSchema
>;

/*
  Expense Edit
*/

export type IFuelExpenseEditRequestDto = z.infer<
  typeof FuelExpenseEditRequestSchema
>;
export type IFuelExpenseEditFormDto = z.input<
  typeof FuelExpenseEditRequestSchema
>;
export type IFuelExpenseEditUIFormDto = Omit<
  IFuelExpenseEditFormDto,
  'vehicleName' | 'cardName'
>;
export type IFuelExpenseEditResponseDto = z.infer<
  typeof FuelExpenseEditResponseSchema
>;

/*
  Expense Force
*/

export type IFuelExpenseForceRequestDto = z.infer<
  typeof FuelExpenseForceRequestSchema
>;
export type IFuelExpenseForceFormDto = z.input<
  typeof FuelExpenseForceRequestSchema
>;
export type IFuelExpenseForceUIFormDto = Omit<
  IFuelExpenseForceFormDto,
  'vehicleName' | 'cardName'
>;
export type IFuelExpenseForceResponseDto = z.infer<
  typeof FuelExpenseForceResponseSchema
>;

/*
  Expense Reimburse
*/

export type IFuelExpenseReimburseRequestDto = z.infer<
  typeof FuelExpenseReimburseRequestSchema
>;
export type IFuelExpenseReimburseFormDto = z.input<
  typeof FuelExpenseReimburseRequestSchema
>;
export type IFuelExpenseReimburseResponseDto = z.infer<
  typeof FuelExpenseReimburseResponseSchema
>;

/*
  Linked User Vehicle Detail
*/

export type ILinkedUserVehicleDetailGetRequestDto = z.infer<
  typeof LinkedUserVehicleDetailGetRequestSchema
>;
export type ILinkedUserVehicleDetailGetFormDto = z.input<
  typeof LinkedUserVehicleDetailGetRequestSchema
>;
export type ILinkedUserVehicleDetailGetResponseDto = z.infer<
  typeof LinkedUserVehicleDetailGetResponseSchema
>;
export type ILinkedUserVehicleDetailDto = z.infer<
  typeof LinkedUserVehicleDetailSchema
>;
export type ILinkedVehiclePetroCardDto = z.infer<
  typeof LinkedVehiclePetroCardSchema
>;
