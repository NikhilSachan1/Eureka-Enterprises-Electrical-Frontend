import z from 'zod';
import { FuelExpenseBaseSchema } from './base-fuel-expense.schema';
import { FuelExpenseGetBaseResponseSchema } from './get-fuel-expense.schema';
import { UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { id } = FuelExpenseBaseSchema.shape;
const { approvalByUser, updatedAt, createdAt } =
  FuelExpenseGetBaseResponseSchema.shape;

export const FuelExpenseDetailGetRequestSchema = z
  .object({
    fuelExpenseId: id,
  })
  .strict()
  .transform(data => {
    return {
      id: data.fuelExpenseId,
    };
  });

export const FuelExpenseDetailGetResponseSchema = z
  .object({
    originalFuelExpenseId: id,
    currentVersion: z.number().int().nonnegative(),
    totalVersions: z.number().int().nonnegative(),
    history: z.array(
      FuelExpenseBaseSchema.extend({
        odometerKm: z.string().nullable(),
        fuelLiters: z.string().nullable(),
        fuelAmount: z.string(),
        pumpMeterReading: z.string().nullable(),
        user: UserSchema,
        createdByUser: UserSchema,
        updatedByUser: makeFieldsNullable(UserSchema).nullable(),
        approvalByUser,
        vehicle: z
          .object({
            id: uuidField,
            registrationNo: z.string().min(1),
            // vehicleType: z.string().min(1),
            // vehicleModel: z.string().min(1),
          })
          .nullable(),
        card: z
          .object({
            id: uuidField,
            cardNumber: z.string().min(1),
            cardType: z.string().min(1),
          })
          .nullable(),
        updatedAt,
        createdAt,
      }).omit({
        approvalBy: true,
        userId: true,
      })
    ),
  })
  .strict();
