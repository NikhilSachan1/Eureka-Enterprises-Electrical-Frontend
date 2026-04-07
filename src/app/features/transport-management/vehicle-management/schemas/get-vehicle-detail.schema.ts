import {
  AuditSchema,
  onlyDateStringField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import {
  VehicleBaseDocumentsSchema,
  VehicleBaseSchema,
} from './base-vehicle.schema';
import { makeFieldsNullable } from '@shared/utility';

const { createdAt, updatedAt, createdBy, updatedBy, deletedBy, deletedAt } =
  AuditSchema.shape;

export const VehicleDetailGetRequestSchema = z
  .object({
    vehicleId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      id: data.vehicleId,
    };
  });

export const VehicleDetailGetBaseResponseSchema = VehicleBaseSchema.omit({
  cardId: true,
})
  .extend({
    createdAt,
    updatedAt,
    createdByUser: UserSchema,
    assignedToUser: makeFieldsNullable(UserSchema).nullable(),
    updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  })
  .loose();

export const VehicleDetailGetVersionHistorySchema =
  VehicleDetailGetBaseResponseSchema.omit({
    fitnessStartDate: true,
    fitnessEndDate: true,
  })
    .extend({
      purchaseDate: onlyDateStringField,
      insuranceStartDate: onlyDateStringField,
      insuranceEndDate: onlyDateStringField,
      pucStartDate: onlyDateStringField,
      pucEndDate: onlyDateStringField,
      isActive: z.boolean(),
      files: z.array(VehicleBaseDocumentsSchema),
      createdBy,
      updatedBy: updatedBy.nullable(),
      deletedBy,
      deletedAt,
    })
    .loose()
    .transform(({ files, ...rest }) => ({
      ...rest,
      documentKeys: files.map(file => file.fileKey),
    }));

export const VehicleDetailGetResponseSchema = z.looseObject({
  ...VehicleDetailGetBaseResponseSchema.omit({
    fitnessStartDate: true,
    fitnessEndDate: true,
  }).shape,
  createdBy,
  updatedBy: updatedBy.nullable(),
  deletedBy: deletedBy.nullable(),
  deletedAt: deletedAt.nullable().optional(),
  purchaseDate: onlyDateStringField,
  insuranceStartDate: onlyDateStringField,
  insuranceEndDate: onlyDateStringField,
  pucStartDate: onlyDateStringField,
  pucEndDate: onlyDateStringField,
  versionHistory: z.array(VehicleDetailGetVersionHistorySchema),
});
