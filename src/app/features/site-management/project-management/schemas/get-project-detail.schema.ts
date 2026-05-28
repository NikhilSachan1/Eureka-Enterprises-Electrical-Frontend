import { UserSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { makeFieldsNullable } from '@shared/utility';
import { ProjectGetBaseResponseSchema } from './get-project.schema';

export const ProjectDetailGetRequestSchema = z
  .object({
    projectId: uuidField,
  })
  .strict();

export const ProjectDetailGetResponseSchema =
  ProjectGetBaseResponseSchema.extend({
    siteContractors: z.array(
      z.object({
        id: uuidField,
        siteId: uuidField,
        contractorId: uuidField,
        contractor: z.looseObject({
          id: uuidField,
          name: z.string(),
          fullAddress: z.string().nullable(),
        }),
      })
    ),
    createdByUser: makeFieldsNullable(UserSchema).nullable(),
    updatedByUser: makeFieldsNullable(UserSchema).optional(),
  }).omit({
    allocatedEmployees: true,
    allocatedEmployeeCount: true,
  });
