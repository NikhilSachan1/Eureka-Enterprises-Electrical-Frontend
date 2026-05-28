import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectBaseSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  companyId: uuidField,
  managerName: z.string(),
  managerContact: z.string().nullable(),
  startDate: onlyDateStringField,
  endDate: onlyDateStringField,
  baseDistanceKm: z.string(),
  status: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().nullable(),
  country: z.string(),
  notes: z.string().nullable(),
  workTypes: z.array(z.string()),
  isActive: z.boolean(),
});

const {
  name,
  companyId,
  managerName,
  managerContact,
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
    contractorNames: z.array(uuidField).min(1),
    vendorNames: z.array(uuidField).nullable(),
    siteManagerName: managerName,
    siteManagerContact: managerContact,
    timeline: z.array(dateField),
    baseDistanceKm: z.number(),
    state,
    city,
    pincode,
    workTypes,
    remarks: notes,
  })
  .strict();
