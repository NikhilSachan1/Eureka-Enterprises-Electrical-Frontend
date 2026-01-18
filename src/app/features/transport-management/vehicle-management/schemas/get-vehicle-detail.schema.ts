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
  .strict();

export const VehicleDetailGetVersionHistorySchema =
  VehicleDetailGetBaseResponseSchema.extend({
    purchaseDate: onlyDateStringField,
    insuranceStartDate: onlyDateStringField,
    insuranceEndDate: onlyDateStringField,
    pucStartDate: onlyDateStringField,
    pucEndDate: onlyDateStringField,
    fitnessStartDate: onlyDateStringField,
    fitnessEndDate: onlyDateStringField,
    assignedTo: uuidField.nullable(),
    vehicleMasterId: uuidField,
    isActive: z.boolean(),
    files: z.array(VehicleBaseDocumentsSchema),
    lastServiceDate: onlyDateStringField.nullable(),
    lastServiceKm: z.number().int().min(1).nullable(),
    createdBy,
    updatedBy: updatedBy.nullable(),
    deletedBy,
    deletedAt,
  })
    .strict()
    .transform(({ files, ...rest }) => ({
      ...rest,
      documentKeys: files.map(file => file.fileKey),
    }));

export const VehicleDetailGetResponseSchema = z
  .object({
    ...VehicleDetailGetBaseResponseSchema.shape,
    createdBy,
    updatedBy: updatedBy.nullable(),
    deletedBy: deletedBy.nullable(),
    deletedAt: deletedAt.nullable().optional(),
    purchaseDate: onlyDateStringField,
    insuranceStartDate: onlyDateStringField,
    insuranceEndDate: onlyDateStringField,
    pucStartDate: onlyDateStringField,
    pucEndDate: onlyDateStringField,
    fitnessStartDate: onlyDateStringField,
    fitnessEndDate: onlyDateStringField,
    assignedTo: uuidField.nullable(),
    files: z.array(VehicleBaseDocumentsSchema),
    deletedByUser: makeFieldsNullable(UserSchema).nullable(),
    versionHistory: z.array(VehicleDetailGetVersionHistorySchema),
    insuranceStatus: z.string().min(1),
    pucStatus: z.string().min(1),
    fitnessStatus: z.string().min(1),
    lastServiceKm: z.number().int().min(1).nullable(),
    lastServiceDate: onlyDateStringField.nullable(),
    associatedCard: z
      .object({
        id: uuidField,
        cardNumber: z.string().min(1),
        cardType: z.string().min(1),
      })
      .nullable(),
  })
  .strict();
