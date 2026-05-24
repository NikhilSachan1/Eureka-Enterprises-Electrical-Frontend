import { z } from 'zod';
import { UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { ProjectGetBaseResponseSchema } from '@features/site-management/project-management/schemas/get-project.schema';

export const DsrDetailGetRequestSchema = z
  .object({
    dsrId: uuidField,
  })
  .strict()
  .transform(data => ({
    id: data.dsrId,
  }));

const DsrDetailFileSchema = z.looseObject({
  id: uuidField,
  fileKey: z.string(),
  fileName: z.string(),
  fileType: z.string(),
});

export const DsrDetailHistoryRecordSchema = z
  .looseObject({
    id: uuidField,
    dsrEntryType: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: UserSchema,
    updatedBy: makeFieldsNullable(UserSchema).nullable(),
    workTypes: z.array(z.string()),
    remarks: z.string().nullable(),
    files: z.array(DsrDetailFileSchema),
    site: ProjectGetBaseResponseSchema.pick({
      id: true,
      name: true,
      city: true,
      state: true,
    }).extend({
      company: z.looseObject({
        name: z.string(),
      }),
    }),
  })
  .transform(({ files, ...rest }) => ({
    ...rest,
    fileKeys: files.map(file => file.fileKey),
  }));

export const DsrDetailGetResponseSchema = z.array(DsrDetailHistoryRecordSchema);
