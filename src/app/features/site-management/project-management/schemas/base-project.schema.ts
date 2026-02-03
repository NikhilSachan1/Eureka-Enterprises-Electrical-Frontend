import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectBaseSchema = z
  .object({
    id: uuidField,
    name: z.string(),
    companyId: uuidField,
    managerName: z.string(),
    managerContact: z.string().nullable(),
    startDate: onlyDateStringField,
    endDate: onlyDateStringField,
    baseDistanceKm: z.string(),
    expectedVehicleDailyKm: z.string().nullable(),
    estimatedBudget: z.string(),
    status: z.string(),
    blockNumber: z.string(),
    buildingName: z.string().nullable(),
    streetName: z.string(),
    landmark: z.string(),
    area: z.string().nullable(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string(),
    notes: z.string().nullable(),
    workTypes: z.array(z.string()),
    isActive: z.boolean(),
  })
  .strict();

const {
  name,
  companyId,
  managerName,
  managerContact,
  blockNumber,
  streetName,
  landmark,
  state,
  city,
  pincode,
  workTypes,
  notes,
} = ProjectBaseSchema.shape;

export const ProjectUpsertShapeSchema = z
  .object({
    projectName: name,
    companyName: companyId,
    contractorNames: z.array(uuidField),
    siteManagerName: managerName,
    siteManagerContact: managerContact,
    timeline: z.array(dateField),
    baseDistanceKm: z.number(),
    estimatedBudget: z.number(),
    blockNumber,
    streetName,
    landmark,
    state,
    city,
    pincode,
    workTypes,
    remarks: notes,
  })
  .strict();
