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
    createdByUser: makeFieldsNullable(UserSchema).nullable(),
    updatedByUser: makeFieldsNullable(UserSchema).optional(),
  }).omit({
    allocatedEmployees: true,
    allocatedEmployeeCount: true,
  });
