import { FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';
import { EMyFileType } from '../types/my-files.enum';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const MyFilesListRequestSchema = z
  .object({
    parentId: uuidField.nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strip();

export const MyFileItemSchema = z.object({
  id: uuidField,
  name: z.string(),
  type: z.enum(EMyFileType),
  parentId: uuidField.nullable(),
  storageKey: z.string().nullable(),
  mimeType: z.string().nullable(),
  size: z.string().nullable(),
});

export const MyFilesListResponseSchema = z
  .object({
    records: z.array(MyFileItemSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strip();

export const MyFilesBreadcrumbItemSchema = z
  .object({
    id: uuidField,
    name: z.string(),
    type: z.enum(EMyFileType),
  })
  .strip();

export const MyFilesBreadcrumbResponseSchema = z
  .object({
    data: z.array(MyFilesBreadcrumbItemSchema),
  })
  .strip();
