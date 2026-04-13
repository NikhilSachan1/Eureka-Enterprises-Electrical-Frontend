import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { FuelExpenseBaseSchema } from './base-fuel-expense.schema';
import {
  makeFieldsNullable,
  toTitleCase,
  transformDateFormat,
} from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { approvalStatus } = FuelExpenseBaseSchema.shape;
const { createdAt, updatedAt, createdBy } = AuditSchema.shape;

export const FuelExpenseGetRequestSchema = z
  .object({
    fuelExpenseDate: z.array(dateField).min(1).optional(),
    employeeName: z.array(uuidField).min(1).optional(),
    approvalStatus: z.array(approvalStatus).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      fuelExpenseDate: dateRange,
      employeeName,
      approvalStatus: fuelExpenseApprovalStatus,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];

      return {
        ...rest,
        userIds: employeeName,
        approvalStatuses: fuelExpenseApprovalStatus,
        startDate: transformDateFormat(start),
        endDate: transformDateFormat(end),
      };
    }
  );

export const FuelExpenseGetBaseResponseSchema = z.looseObject({
  ...FuelExpenseBaseSchema.shape,
  user: UserSchema,
  approvalByUser: makeFieldsNullable(UserSchema).nullable(),
  vehicle: z
    .object({
      id: uuidField,
      registrationNo: z.string().min(1),
      brand: z.string().min(1),
      model: z.string().min(1),
      fuelType: z.string().min(1),
      mileage: z.string().min(1),
      status: z.string().min(1),
    })
    .nullable(),
  card: z
    .object({
      id: uuidField,
      cardNumber: z.string().min(1),
      cardType: z.string().min(1),
    })
    .nullable(),
  fuelEfficiency: z
    .object({
      distanceTraveled: z.number(),
      kmPerLiter: z.number(),
      previousOdometerKm: z.number(),
      previousKmPerLiter: z.number().nullable(),
      efficiencyChange: z.number().nullable(),
      efficiencyChangePercent: z.number().nullable(),
    })
    .nullable()
    .optional(),
  approvalStatus: approvalStatus.transform(toTitleCase),
  createdAt,
  updatedAt,
  createdBy,
  canEdit: z.boolean(),
});

export const FuelExpenseGetStatsResponseSchema = z.looseObject({
  balances: z.looseObject({
    openingBalance: z.number(),
    closingBalance: z.number(),
    totalCredit: z.number().nonnegative(),
    totalDebit: z.number().nonnegative(),
    periodCredit: z.number().nonnegative(),
    periodDebit: z.number().nonnegative(),
    totalPetroCardDebitApproved: z.number(),
    totalPetroCardExpense: z.number(),
  }),
  projectedBalances: z.looseObject({
    openingBalance: z.number(),
    closingBalance: z.number(),
    periodCredit: z.number().nonnegative(),
    periodDebit: z.number().nonnegative(),
  }),
  approval: z.looseObject({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
});

export const FuelExpenseGetResponseSchema = z.looseObject({
  records: z.array(FuelExpenseGetBaseResponseSchema),
  stats: FuelExpenseGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
